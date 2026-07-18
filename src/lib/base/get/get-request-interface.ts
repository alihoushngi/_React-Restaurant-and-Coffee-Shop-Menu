import type { AxiosRequestConfig } from "axios";
import type { IRequestOption } from "../requestBase.types";

export interface IGetRequestOption<D>
  extends Omit<AxiosRequestConfig, "method" | "data">, IRequestOption<D> {}
