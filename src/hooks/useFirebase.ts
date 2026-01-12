import { useState, useEffect } from "react";
import { 
  getDocument, 
  getDocuments, 
  createDocument, 
  updateDocument, 
  deleteDocument,
  firestoreHelpers 
} from "../services/firebase.service";
import { QueryConstraint, DocumentData } from "firebase/firestore";

/**
 * Hook for fetching a single document
 */
export const useFirebaseDocument = <T = DocumentData>(
  collectionName: string,
  documentId: string | null,
  enabled: boolean = true
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !documentId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getDocument<T>(collectionName, documentId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, documentId, enabled]);

  const refetch = async () => {
    if (!documentId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await getDocument<T>(collectionName, documentId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

/**
 * Hook for fetching multiple documents
 */
export const useFirebaseCollection = <T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  enabled: boolean = true
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getDocuments<T>(collectionName, constraints);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, enabled, JSON.stringify(constraints)]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDocuments<T>(collectionName, constraints);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

/**
 * Hook for CRUD operations
 */
export const useFirebaseCRUD = <T = DocumentData>(collectionName: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: Omit<T, "id">): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      const id = await createDocument<T>(collectionName, data);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (documentId: string, data: Partial<T>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await updateDocument<T>(collectionName, documentId, data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (documentId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await deleteDocument(collectionName, documentId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    update,
    remove,
    loading,
    error,
  };
};

// Export firestore helpers for convenience
export { firestoreHelpers };

