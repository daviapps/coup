import { HTMLAttributes, MouseEvent } from "react";
import * as S from "./styles";

export type ButtonProps = HTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "link";
  disabled?: boolean;
};

export function Button({
  children,
  variant = "default",
  disabled = false,
  onClick,
  ...props
}: ButtonProps) {
  return (
    <S.Wrapper
      {...props}
      onClick={(e: MouseEvent<HTMLButtonElement>) =>
        !disabled && onClick && onClick(e)
      }
      data-variant={variant}
      data-disabled={String(disabled)}
    >
      {children}
    </S.Wrapper>
  );
}
