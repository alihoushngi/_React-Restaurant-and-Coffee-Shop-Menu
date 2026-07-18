import type { AxiosRequestConfig } from "axios";
import type { IRequestOption } from "../requestBase.types";

export interface IDeleteRequestOption<D>
  extends Omit<AxiosRequestConfig<D>, "method">, IRequestOption<D> {}
