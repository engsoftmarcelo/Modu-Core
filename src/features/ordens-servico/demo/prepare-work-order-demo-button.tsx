"use client";

import { ArrowRight, LoaderCircle, PlayCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

import { prepareWorkOrderDemoAction } from "./actions";

function SubmitDemoButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="w-full sm:w-auto"
    >
      {pending ? (
        <LoaderCircle className="size-5 animate-spin" />
      ) : (
        <PlayCircle className="size-5" />
      )}
      {pending ? "Preparando..." : "Iniciar demo"}
      {!pending ? <ArrowRight className="size-5" /> : null}
    </Button>
  );
}

export function PrepareWorkOrderDemoButton() {
  return (
    <form action={prepareWorkOrderDemoAction}>
      <SubmitDemoButton />
    </form>
  );
}
