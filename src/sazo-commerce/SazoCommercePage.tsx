import { useReducer } from "react";
import { SazoShell } from "@/sazo-commerce/SazoShell";
import { createInitialSazoState, sazoReducer } from "@/sazo-commerce/model";
import "@/sazo-commerce/sazo.css";

export function SazoCommercePage() {
  const [state, dispatch] = useReducer(sazoReducer, undefined, createInitialSazoState);

  return <SazoShell dispatch={dispatch} state={state} />;
}
