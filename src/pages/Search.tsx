import { Navigate } from "react-router-dom";
import { getLastMenuMode, getMenuPath } from "../lib/menu/utils";

export default function SearchPage() {
  return <Navigate to={`${getMenuPath(getLastMenuMode())}?search=1`} replace />;
}
