import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../../lib/constants";

import './style.css';

export default function Header(){
  const { i18n } = useTranslation();

  const onChangeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang_code = e.target.value;
    localStorage.setItem('lang', lang_code);
    i18n.changeLanguage(lang_code);
  };

  return (
    <header className="page-header">
      <div className="d-flex">
        <div className="flex-grow-1"></div>
        <select defaultValue={i18n.language} onChange={onChangeLang}>
          {LANGUAGES.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </header>
  )
}
