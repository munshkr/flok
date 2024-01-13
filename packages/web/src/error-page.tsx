import { useRouteError, isRouteErrorResponse } from "react-router-dom";

const ErrorMessage = ({ value }: { value: unknown }) => {
  if (isRouteErrorResponse(value)) {
    return (
      <p>
        {value.status} {value.statusText}
      </p>
    );
  }

  return <p>{String(value) || "Unknown Error"}</p>;
};

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <ErrorMessage value={error} />
    </div>
  );
}
