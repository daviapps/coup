import './style.css';

export type TemplateProps = React.PropsWithChildren<{
  template: string
}>;

export default function Template({
  children
}: TemplateProps) {
  return (
    <div className="">
      {children}
    </div>
  );
}
