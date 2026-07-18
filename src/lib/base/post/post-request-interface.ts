import type { AxiosRequestConfig } from "axios";
import type { IRequestOption } from "../requestBase.types";

export interface IPostRequestOption<D>
  extends Omit<AxiosRequestConfig<D>, "method">, IRequestOption<D> {}
