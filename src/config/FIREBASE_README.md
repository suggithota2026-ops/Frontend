# Firebase Configuration & Usage Guide

## Overview

Firebase has been initialized and configured for the PRK Smiles Admin Panel. This setup includes:

- **Firebase App** - Core Firebase initialization
- **Firestore** - NoSQL database for storing data
- **Storage** - File storage for images and documents
- **Authentication** - User authentication (ready to use)
- **Analytics** - App analytics (initialized if supported)
- **Messaging** - Push notifications (initialized if supported)

## Configuration

Firebase is configured in `src/config/firebase.ts` with the following services:

```typescript
import { db, storage, auth, analytics, messaging } from "@/config/firebase";
```

## Services Available

### 1. Firestore (Database)
- **Export**: `db`
- **Use for**: Storing products, orders, categories, users, etc.

### 2. Storage
- **Export**: `storage`
- **Use for**: Uploading product images, invoices, documents

### 3. Authentication
- **Export**: `auth`
- **Use for**: User authentication and authorization

### 4. Analytics
- **Export**: `analytics`
- **Use for**: Tracking app usage and events

### 5. Messaging
- **Export**: `messaging`
- **Use for**: Push notifications

## Quick Start

### Using React Hooks (Recommended)

```typescript
import { useFirebaseCollection, useFirebaseCRUD } from "@/hooks/useFirebase";
import { firestoreHelpers } from "@/hooks/useFirebase";

// Fetch products
const { data: products, loading, error, refetch } = useFirebaseCollection<Product>(
  "products",
  [
    firestoreHelpers.where("isActive", "==", true),
    firestoreHelpers.orderBy("createdAt", "desc"),
  ]
);

// CRUD operations
const { create, update, remove } = useFirebaseCRUD<Product>("products");
```

### Using Service Functions Directly

```typescript
import {
  getDocument,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  uploadFile,
  getFileURL,
  deleteFile,
} from "@/services/firebase.service";
import { firestoreHelpers } from "@/services/firebase.service";

// Get a single document
const product = await getDocument<Product>("products", "productId");

// Get multiple documents
const products = await getDocuments<Product>("products", [
  firestoreHelpers.where("category", "==", "electronics"),
  firestoreHelpers.orderBy("price", "asc"),
]);

// Create a document
const productId = await createDocument<Product>("products", {
  name: "Product Name",
  price: 100,
  // ... other fields
});

// Update a document
await updateDocument<Product>("products", productId, {
  price: 120,
});

// Delete a document
await deleteDocument("products", productId);

// Upload a file
const imageUrl = await uploadFile("products/image.jpg", file, {
  contentType: "image/jpeg",
});

// Get file URL
const url = await getFileURL("products/image.jpg");

// Delete a file
await deleteFile("products/image.jpg");
```

## Example: Products Management

See `src/examples/firebase-products-example.tsx` for a complete example of:
- Fetching products from Firestore
- Creating products with image uploads
- Updating products
- Deleting products and their images

## Available Hooks

### `useFirebaseDocument<T>`
Fetch a single document by ID.

```typescript
const { data, loading, error, refetch } = useFirebaseDocument<Product>(
  "products",
  "productId",
  true // enabled
);
```

### `useFirebaseCollection<T>`
Fetch multiple documents with optional query constraints.

```typescript
const { data, loading, error, refetch } = useFirebaseCollection<Product>(
  "products",
  [
    firestoreHelpers.where("isActive", "==", true),
    firestoreHelpers.orderBy("name", "asc"),
  ],
  true // enabled
);
```

### `useFirebaseCRUD<T>`
Perform create, update, and delete operations.

```typescript
const { create, update, remove, loading, error } = useFirebaseCRUD<Product>("products");

// Create
const id = await create({ name: "Product", price: 100 });

// Update
const success = await update(id, { price: 120 });

// Delete
const deleted = await remove(id);
```

## File Upload Example

```typescript
import { uploadFile } from "@/services/firebase.service";

const handleImageUpload = async (file: File) => {
  try {
    const imagePath = `products/${Date.now()}_${file.name}`;
    const imageUrl = await uploadFile(imagePath, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: "admin",
        productId: "123",
      },
    });
    console.log("Image uploaded:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};
```

## Query Helpers

Available query constraints:

```typescript
import { firestoreHelpers } from "@/hooks/useFirebase";

// Where clause
firestoreHelpers.where("status", "==", "active")
firestoreHelpers.where("price", ">", 100)
firestoreHelpers.where("name", "in", ["Product 1", "Product 2"])

// Order by
firestoreHelpers.orderBy("createdAt", "desc")
firestoreHelpers.orderBy("price", "asc")

// Limit
firestoreHelpers.limit(10)
```

## Type Safety

All functions are TypeScript typed. Define your interfaces:

```typescript
interface Product {
  id?: string;
  name: string;
  price: number;
  category: string;
  // ... other fields
}
```

Then use them with Firebase functions:

```typescript
const products = await getDocuments<Product>("products");
```

## Error Handling

All Firebase operations include error handling. Always wrap in try-catch:

```typescript
try {
  const product = await getDocument<Product>("products", "id");
} catch (error) {
  console.error("Error:", error);
  // Handle error
}
```

## Best Practices

1. **Use Hooks**: Prefer `useFirebaseCollection` and `useFirebaseDocument` for React components
2. **Type Safety**: Always define TypeScript interfaces for your data
3. **Error Handling**: Always handle errors appropriately
4. **Loading States**: Use the `loading` state from hooks to show loading indicators
5. **File Naming**: Use unique file names for uploads (e.g., `Date.now()_filename`)
6. **Cleanup**: Delete files from Storage when deleting documents that reference them

## Firebase Console

Access your Firebase project at: https://console.firebase.google.com/project/prk-smiles

## Security Rules

Make sure to configure Firestore Security Rules and Storage Rules in the Firebase Console to protect your data.

## Support

For more information, see:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Storage Documentation](https://firebase.google.com/docs/storage)

