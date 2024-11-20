<?php

namespace App\Entity;

use App\Repository\ProductRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['get_order', 'create_order'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['get_order'])]
    private ?string $name = null;

    #[ORM\Column]
    private ?int $availableStock = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $skin = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $aromas = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $ingredients = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['get_order'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['get_order'])]
    private ?float $price = null;

    #[ORM\Column(length: 255)]
    #[Groups(['get_order'])]
    private ?string $picture = null;

    #[ORM\Column]
    private ?int $varieties = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getAvailableStock(): ?int
    {
        return $this->availableStock;
    }

    public function setAvailableStock(int $availableStock): self
    {
        $this->availableStock = $availableStock;

        return $this;
    }

    public function getSkin(): ?string
    {
        return $this->skin;
    }

    public function setSkin(?string $skin): self
    {
        $this->skin = $skin;

        return $this;
    }

    public function getAromas(): ?string
    {
        return $this->aromas;
    }

    public function setAromas(?string $aromas): self
    {
        $this->aromas = $aromas;

        return $this;
    }

    public function getIngredients(): ?string
    {
        return $this->ingredients;
    }

    public function setIngredients(?string $ingredients): self
    {
        $this->ingredients = $ingredients;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): self
    {
        $this->price = $price;

        return $this;
    }

    public function getPicture(): ?string
    {
        return $this->picture;
    }

    public function setPicture(string $picture): self
    {
        $this->picture = $picture;

        return $this;
    }

    public function getVarieties(): ?int
    {
        return $this->varieties;
    }

    public function setVarieties(int $varieties): self
    {
        $this->varieties = $varieties;

        return $this;
    }
}
