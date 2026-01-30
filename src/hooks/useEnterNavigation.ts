import { useRef, useEffect } from 'react';

interface UseEnterNavigationProps {
  onSubmit: () => void;
  disabled?: boolean;
}

export const useEnterNavigation = ({ onSubmit, disabled = false }: UseEnterNavigationProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (disabled || !formRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle Enter key
      if (event.key !== 'Enter') return;

      // Prevent default form submission
      event.preventDefault();

      const activeElement = document.activeElement as HTMLElement;
      
      // If we're in a textarea, allow normal Enter behavior (new line)
      if (activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      // If we're in a select dropdown, close it normally
      if (activeElement?.tagName === 'SELECT') {
        return;
      }

      // Find all focusable input elements in the form
      const form = formRef.current;
      if (!form) return;

      const focusableElements = Array.from(
        form.querySelectorAll(
          'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'
        )
      ) as HTMLElement[];

      // Remove buttons except submit buttons from navigation flow
      const navigableElements = focusableElements.filter(el => 
        el.tagName !== 'BUTTON' || 
        (el as HTMLButtonElement).type === 'submit' ||
        el.getAttribute('data-enter-navigate') === 'true'
      );

      const currentIndex = navigableElements.indexOf(activeElement);
      
      // If we're at the last field, trigger submit
      if (currentIndex === navigableElements.length - 1) {
        onSubmit();
        return;
      }

      // Move to next field
      const nextIndex = currentIndex + 1;
      if (nextIndex < navigableElements.length) {
        const nextElement = navigableElements[nextIndex];
        nextElement.focus();
        
        // For input and textarea elements, select all text for easy editing
        if (nextElement.tagName === 'INPUT' || nextElement.tagName === 'TEXTAREA') {
          (nextElement as HTMLInputElement | HTMLTextAreaElement).select();
        }
      }
    };

    const form = formRef.current;
    form?.addEventListener('keydown', handleKeyDown);

    return () => {
      form?.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSubmit, disabled]);

  return { formRef };
};