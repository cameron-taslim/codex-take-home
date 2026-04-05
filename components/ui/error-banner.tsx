import React from "react";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="banner banner-error">
      {message}
    </div>
  );
}
