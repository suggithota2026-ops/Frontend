/**
 * Example: Using Firebase with Products
 * 
 * This file demonstrates how to use Firebase Firestore and Storage
 * for managing products in the admin panel.
 */

import { useState } from "react";
import { useFirebaseCollection, useFirebaseCRUD, firestoreHelpers } from "../hooks/useFirebase";
import { uploadFile, deleteFile } from "../services/firebase.service";
import { toast } from "sonner";

// Product interface
interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Example Component: Product List with Firebase
 */
export const FirebaseProductsExample = () => {
  // Fetch products from Firestore
  const { data: products, loading, error, refetch } = useFirebaseCollection<Product>(
    "products",
    [
      firestoreHelpers.where("isActive", "==", true),
      firestoreHelpers.orderBy("createdAt", "desc"),
      firestoreHelpers.limit(20)
    ]
  );

  // CRUD operations
  const { create, update, remove, loading: crudLoading } = useFirebaseCRUD<Product>("products");

  const [uploading, setUploading] = useState(false);

  // Create a new product
  const handleCreateProduct = async (productData: Omit<Product, "id">, imageFile?: File) => {
    try {
      let imageUrl = "";

      // Upload image if provided
      if (imageFile) {
        setUploading(true);
        const imagePath = `products/${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadFile(imagePath, imageFile, {
          contentType: imageFile.type,
        });
        setUploading(false);
      }

      // Create product document
      const newProduct: Omit<Product, "id"> = {
        ...productData,
        imageUrl,
      };

      const productId = await create(newProduct);
      
      if (productId) {
        toast.success("Product created successfully!");
        refetch();
      } else {
        toast.error("Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Error creating product");
      setUploading(false);
    }
  };

  // Update a product
  const handleUpdateProduct = async (
    productId: string,
    updates: Partial<Product>,
    newImageFile?: File
  ) => {
    try {
      // Upload new image if provided
      if (newImageFile) {
        setUploading(true);
        const imagePath = `products/${Date.now()}_${newImageFile.name}`;
        const imageUrl = await uploadFile(imagePath, newImageFile, {
          contentType: newImageFile.type,
        });
        updates.imageUrl = imageUrl;
        setUploading(false);
      }

      const success = await update(productId, updates);
      
      if (success) {
        toast.success("Product updated successfully!");
        refetch();
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error updating product");
      setUploading(false);
    }
  };

  // Delete a product
  const handleDeleteProduct = async (productId: string, imageUrl?: string) => {
    try {
      // Delete image from storage if exists
      if (imageUrl) {
        // Extract path from URL or use full path
        const imagePath = imageUrl.split("/o/")[1]?.split("?")[0] || imageUrl;
        await deleteFile(decodeURIComponent(imagePath));
      }

      const success = await remove(productId);
      
      if (success) {
        toast.success("Product deleted successfully!");
        refetch();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error deleting product");
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Products (Firebase Example)</h2>
      <div>
        {products.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: ₹{product.price}</p>
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.name} style={{ maxWidth: "200px" }} />
            )}
            <button onClick={() => handleDeleteProduct(product.id!, product.imageUrl)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Example: Direct Firestore operations (without hooks)
 */
export const directFirestoreExample = async () => {
  const { getDocuments, createDocument, updateDocument, deleteDocument } = await import(
    "../services/firebase.service"
  );
  const { firestoreHelpers } = await import("../hooks/useFirebase");

  // Get all active products
  const products = await getDocuments<Product>("products", [
    firestoreHelpers.where("isActive", "==", true),
    firestoreHelpers.orderBy("name", "asc"),
  ]);

  // Create a new product
  const productId = await createDocument<Product>("products", {
    name: "New Product",
    description: "Product description",
    price: 100,
    category: "electronics",
    stock: 50,
    isActive: true,
  });

  // Update product
  await updateDocument<Product>("products", productId, {
    price: 120,
  });

  // Delete product
  await deleteDocument("products", productId);
};

