<?php

namespace App\Controller;

use OpenApi\Attributes as OA;
use Nelmio\ApiDocBundle\Annotation\Model;
use App\Entity\Review;
use App\Form\ReviewType;
use App\Repository\ReviewRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;

#[OA\Tag("Avis")]
class ReviewsController extends AbstractController
{
    /**
     * Récupère les avis postés sur le site
     */
    #[Route('/reviews', name: 'get_reviews', methods: ['GET'])]
    #[OA\Response(
        response: 200,
        description: 'Liste des avis',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: Review::class))
        )
    )]
    public function getReviews(ReviewRepository $reviewRepository): JsonResponse
    {
        return $this->json($reviewRepository->findBy([], ['date' => 'DESC']));
    }

    /**
     * Crée un nouvel avis
     */
    #[Route('/reviews', name: 'post_review', methods: ['POST'])]
    #[OA\RequestBody(
        description: 'Informations de l\'avis à créer',
        content: new Model(type: Review::class, groups: ['create'])
    )]
    #[OA\Response(
        response: 200,
        description: 'Informations de l\'avis créé',
        content: new Model(type: Review::class)
    )]
    #[OA\Response(
        response: 400,
        description: 'Erreur dans les données envoyées',
    )]
    public function postReview(Request $request, ReviewRepository $reviewRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$this->isGranted('ROLE_USER')) {
            throw $this->createAccessDeniedException();
        }

        $data = json_decode($request->getContent(), true);

        $review = new Review();

        $form = $this->createForm(ReviewType::class, $review);

        $form->submit($data);
        if ($form->isValid()) {
            $review->setDate(new \DateTime())
                ->setAuthor($this->getUser());

            $entityManager->persist($review);
            $entityManager->flush();
        } else {
            return $this->json(['error' => $form->getErrors()], Response::HTTP_BAD_REQUEST);
        }

        return $this->json($review);
    }
}
