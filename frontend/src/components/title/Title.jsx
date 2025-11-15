import { useTitle } from "react-haiku";

export default function Title({ title, children }) {
  useTitle(title);
  return children;
}

