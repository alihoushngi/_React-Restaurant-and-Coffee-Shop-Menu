import type { IResponse } from "../requestBase.types";
import { sendRequest } from "../requsetBase";
import type { IPutRequestOption } from "./put-request-interface";

export default async function putRequest<T, D>(
  options: IPutRequestOption<D>,
): Promise<IResponse<T>> {
  return sendRequest<T>({ method: "PUT", ...options });
}
