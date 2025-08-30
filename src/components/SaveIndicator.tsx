import React from 'react';
import { Badge } from '@mantine/core';

export default function SaveIndicator({ status }: { status: string }) {
  const isSaved = status === 'Saved';
  const isError = status === 'Error saving';
  
  let color: string;
  let variant: "filled" | "light" | "outline" = "light";
  
  if (isSaved) {
    color = "green";
  } else if (isError) {
    color = "red";
    variant = "filled";
  } else {
    color = "indigo";
  }

  return (
    <Badge 
      color={color} 
      variant={variant}
      radius="xl"
      size="sm"
      aria-live="polite"
      title={status}
    >
      {status}
    </Badge>
  );
}