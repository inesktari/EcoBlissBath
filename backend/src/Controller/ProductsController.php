<?php

namespace App\Controller;

use OpenApi\Attributes as OA;
use Nelmio\ApiDocBundle\Annotation\Model;
use App\Entity\Product;
use App\Repository\ProductRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;

#[OA\Tag("Produits")]
class ProductsController extends AbstractController
{
    /**
     * Récupère la liste des produits
     */
    #[Route('/products', name: 'get_products', methods: ['GET'])]
    #[OA\Response(
        response: 200,
        description: 'Liste des produits',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: Product::class))
        )
    )]
    public function getProducts(ProductRepository $productRepository): JsonResponse
    {
        return $this->json($productRepository->findAll());
    }

    /**
     * Récupère 3 produits aléatoires
     */
    #[Route('/products/random', name: 'get_random_products', methods: ['GET'])]
    #[OA\Response(
        response: 200,
        description: 'Liste des produits aléatoires',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: Product::class))
        )
    )]
    public function getRandomProducts(ProductRepository $productRepository): JsonResponse
    {
        $products = $productRepository->findAll();
        shuffle($products);

        return $this->json(array_values(array_slice($products, 0, 3)));
    }

    /**
     * Récupère le détail d'un produit
     */
    #[Route('/products/{id}', name: 'get_product', requirements: ['id' => '\d+'], methods: ['GET'])]
    #[OA\Parameter(
        name: 'id',
        in: 'path',
        description: 'ID du produit à récupérer',
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Détail d\'un produit',
        content: new Model(type: Product::class)
    )]
    #[OA\Response(
        response: 404,
        description: 'Produit inexistant',
    )]
    public function getProduct(ProductRepository $productRepository, int $id): JsonResponse
    {
        $product = $productRepository->find($id);

        if(is_null($product)) {
            throw new NotFoundHttpException();
        }
        return $this->json($product);
    }
}
