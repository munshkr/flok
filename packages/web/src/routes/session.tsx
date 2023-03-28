import { useLoaderData } from "react-router-dom";

interface ISessionLoaderParams {
  name: string;
}

export async function loader({ params }: { params: any }) {
  return { name: params.name };
}

export default function SessionPage() {
  const { name } = useLoaderData() as ISessionLoaderParams;

  return <h1>{name}</h1>;
}
