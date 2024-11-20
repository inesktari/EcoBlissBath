<?php

namespace App\Controller;

use OpenApi\Attributes as OA;
use Nelmio\ApiDocBundle\Annotation\Model;
use App\Entity\User;
use App\Form\UserType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;

#[OA\Tag("Utilisateurs")]
class UserController extends AbstractController
{
    /**
     * Permet de s'inscrire
     */
    #[Route('/register', name: 'register', methods: ['POST'])]
    #[OA\RequestBody(
        description: 'Informations de l\'utilisateur inscrit',
        content: new Model(type: User::class, groups: ['create'])
    )]
    #[OA\Response(
        response: 200,
        description: 'Informations de l\'utilisateur inscrit',
        content: new Model(type: User::class)
    )]
    #[OA\Response(
        response: 400,
        description: 'Erreur dans les données envoyées',
    )]
    public function register(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $user = new User();

        $form = $this->createForm(UserType::class, $user);

        $form->submit($data);
        if ($form->isValid()) {
            $password = $passwordHasher->hashPassword($user, $user->getPlainPassword());
            $user->setPassword($password);

            $entityManager->persist($user);
            $entityManager->flush();
        } else {
            return $this->json($this->getErrorsFromForm($form), Response::HTTP_BAD_REQUEST);
        }

        return $this->json($user);
    }

    /**
     * Récupère les infos de l'utilisateur connecté
     */
    #[Route('/me', name: 'me', methods: ['GET'])]
    #[OA\Response(
        response: 200,
        description: 'Informations de l\'utilisateur connecté',
        content: new Model(type: User::class)
    )]
    public function me(UserInterface $user): JsonResponse
    {
        return $this->json($user);
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
