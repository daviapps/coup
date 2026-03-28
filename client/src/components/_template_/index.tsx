import { PropsWithChildren } from "react";
import * as S from "./styles";

export type TemplateProps = PropsWithChildren;

export function Template({ children }: TemplateProps) {
  return <S.Wrapper>{children}</S.Wrapper>;
}
