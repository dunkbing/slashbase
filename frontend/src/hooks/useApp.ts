import { useAppActions } from "./useAppActions";
import { useAppSelectors } from "./useAppSelectors";

export function useApp() {
  const actions = useAppActions();
  const selectors = useAppSelectors();

  return {
    ...actions,
    ...selectors,
  };
}

// For backwards compatibility, provide the individual hooks as well
export { useAppActions, useAppSelectors };
