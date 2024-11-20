<?php

namespace App\Controller;

use OpenApi\Attributes as OA;
use Nelmio\ApiDocBundle\Annotation\Model;
use App\Entity\Order;
use App\Entity\OrderLine;
use App\Entity\User;
use App\Form\OrderLineType;
use App\Form\OrderType;
use App\Repository\OrderLineRepository;
use App\Repository\OrderRepository;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;

#[OA\Tag("Commandes")]
class OrdersController extends AbstractController
{

    /**
     * Récupère le panier en cours chez l'utilisateur courant
     */
    #[Route('/orders', name: 'get_order', methods: ['GET'])]
    #[OA\Response(
        response: 200,
        description: 'Commande en cours',
        content: new Model(type: Order::class, groups: ['get_order'])
    )]
    #[OA\Response(
        response: 404,
        description: 'Aucune commande en cours',
    )]    
    public function getCurrentOrder(OrderRepository $orderRepository): JsonResponse
    {
        if (!$this->isGranted('ROLE_USER')) {
            throw $this->createAccessDeniedException();
        }

        $order = $orderRepository->findOneBy(['owner' => $this->getUser(), 'validated' => false]);

        if(is_null($order)) {
            throw new NotFoundHttpException();
        }

        return $this->json($order, Response::HTTP_OK, [], ['groups' => ['get_order']]);
    }

    /**
     * Ajoute un produit dans le panier
     */
    #[Route('/orders/add', name: 'add_product_to_cart', methods: ['PUT'])]
    #[OA\RequestBody(
        description: 'Informations du produit à ajouter',
        content: new OA\JsonContent(type: 'object', properties: [
            new OA\Property(property: 'product', type: 'integer'), 
            new OA\Property(property: 'quantity', type: 'integer'),
        ])
    )]
    #[OA\Response(
        response: 200,
        description: 'Panier mis à jour',
        content: new Model(type: Order::class, groups: ['get_order'])
    )]
    public function addProductToCart(Request $request, OrderRepository $orderRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$this->isGranted('ROLE_USER')) {
            throw $this->createAccessDeniedException();
        }

        $order = $orderRepository->findOneBy(['owner' => $this->getUser(), 'validated' => false]);

        if(is_null($order)) {
            $order = (new Order())
                ->setOwner($this->getUser())
                ->setValidated(false);
            $entityManager->persist($order);
        }

        $orderLine = new OrderLine();

        $data = json_decode($request->getContent(), true);
        $form = $this->createForm(OrderLineType::class, $orderLine);

        $form->submit($data);
        if ($form->isValid()) {
            $productFound = false;
            /** @var OrderLine $line */
            foreach($order->getOrderLines() as $line) {
                if($line->getProduct()->getId() === $orderLine->getProduct()->getId()) {
                    $productFound = true;
                    $line->setQuantity($line->getQuantity() + $orderLine->getQuantity());
                }
            }

            if(!$productFound) {
                $orderLine->setLinkedOrder($order);
                $entityManager->persist($orderLine);
            }

            $orderLine->getProduct()->setAvailableStock($orderLine->getProduct()->getAvailableStock() - $orderLine->getQuantity());
            $entityManager->flush();
        } else {
            return $this->json(['error' => $this->getErrorsFromForm($form)], Response::HTTP_BAD_REQUEST);
        }
        $entityManager->refresh($order);

        return $this->json($order, Response::HTTP_OK, [], ['groups' => ['get_order']]);
    }

    /**
     * Supprime un produit du panier
     */
    #[Route('/orders/{id}/delete', name: 'delete_product_from_cart', methods: ['DELETE'])]
    #[OA\Parameter(
        name: 'id',
        in: 'path',
        description: 'ID de la ligne du panier à supprimer',
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Produit supprimé',
        content: new Model(type: Order::class, groups: ['get_order'])
    )]
    #[OA\Response(
        response: 404,
        description: 'Produit non trouvé',
    )]
    public function deleteProductFromCart($id, #[User] UserInterface $user, OrderLineRepository $orderLineRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$this->isGranted('ROLE_USER')) {
            throw $this->createAccessDeniedException();
        }

        $orderLine = $orderLineRepository->find($id);

        if(is_null($orderLine) || $orderLine->getLinkedOrder()->isValidated() || $orderLine->getLinkedOrder()->getOwner()->getId() !== $user->getId()) {
            throw new NotFoundHttpException('Produit non trouvé');
        }

        $orderLine->getProduct()->setAvailableStock($orderLine->getProduct()->getAvailableStock() + $orderLine->getQuantity());

        $order = $orderLine->getLinkedOrder();

        $entityManager->remove($orderLine);
        $entityManager->flush();
        return $this->json($order, Response::HTTP_OK, [], ['groups' => ['get_order']]);
    }

    /**
     * Modifie la quantité d'un produit dans le panier
     */
    #[Route('/orders/{id}/change-quantity', name: 'change_product_from_cart', methods: ['PUT'])]
    #[OA\Parameter(
        name: 'id',
        in: 'path',
        description: 'ID de la ligne du panier à modifier',
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\RequestBody(
        description: 'Informations du produit à modifier',
        content: new Model(type: OrderLine::class, groups: ['update_order'])
    )]
    #[OA\Response(
        response: 200,
        description: 'Produit mis à jour',
        content: new Model(type: OrderLine::class, groups: ['get_order'])
    )]
    #[OA\Response(
        response: 404,
        description: 'Produit non trouvé',
    )]
    public function changeProduct(Request $request, $id, #[User] UserInterface $user, OrderRepository $orderRepository, OrderLineRepository $orderLineRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$this->isGranted('ROLE_USER')) {
            throw $this->createAccessDeniedException();
        }

        $orderLine = $orderLineRepository->find($id);
        $data = json_decode($request->getContent(), true);

        if(is_null($orderLine) || $orderLine->getLinkedOrder()->isValidated() || $orderLine->getLinkedOrder()->getOwner()->getId() !== $user->getId()) {
            throw new NotFoundHttpException('Produit non trouvé');
        }

        if(!isset($data['quantity']) || !is_int($data['quantity']) || $data['quantity'] <= 0) {
            throw new BadRequestException('Quantité incorrecte');
        }

        $orderLine->getProduct()->setAvailableStock($orderLine->getProduct()->getAvailableStock() + $orderLine->getQuantity() - intval($data['quantity']));
        $orderLine->setQuantity($data['quantity']);

        $entityManager->flush();
        return $this->json($orderLine->getLinkedOrder(), Response::HTTP_OK, [], ['groups' => ['get_order']]);
    }

    /**
     * Crée / valide la commande en cours
     */
    #[Route('/orders', name: 'post_order', methods: ['POST'])]
    #[OA\RequestBody(
        description: 'Informations de commande',
        content: new Model(type: Order::class, groups: ['create'])
    )]
    #[OA\Response(
        response: 200,
        description: 'Commande validée',
        content: new Model(type: Order::class, groups: ['get_order'])
    )]
    #[OA\Response(
        response: 404,
        description: 'Pas de commande en cours',
    )]
    public function postOrder(Request $request, UserInterface $user, OrderRepository $orderRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$this->isGranted('ROLE_USER')) {
            throw $this->createAccessDeniedException();
        }

        $order = $orderRepository->findOneBy(['owner' => $user, 'validated' => false]);

        if(is_null($order)) {
            throw new NotFoundHttpException();
        }
        $data = json_decode($request->getContent(), true);
        $form = $this->createForm(OrderType::class, $order);

        $form->submit($data);
        if ($form->isValid()) {
            $order->setDate(new DateTime())
                ->setValidated(true);
            $entityManager->flush();
        } else {
            return $this->json(['error' => $form->getErrors()], Response::HTTP_BAD_REQUEST);
        }

        return $this->json($order, Response::HTTP_OK, [], ['groups' => ['get_order']]);
    }

    private function getErrorsFromForm(FormInterface $form)
    {
        $errors = array();
        foreach ($form->getErrors() as $error) {
            $errors[] = $error->getMessage();
        }
        foreach ($form->all() as $childForm) {
            if ($childForm instanceof FormInterface) {
                if ($childErrors = $this->getErrorsFromForm($childForm)) {
                    $errors[$childForm->getName()] = $childErrors;
                }
            }
        }
        return $errors;
    }

}
