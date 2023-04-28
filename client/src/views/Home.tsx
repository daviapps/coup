import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Home(){
  const { t } = useTranslation();

  return (
    <section className="container join-container d-flex">
      <div className="d-flex flex-column form--center">
        <center className="mb-3">
          <h1>{t("app_name")}</h1>
          <p>{t("app_developed_by")} <a href="https://github.com/daviinacio">daviinacio</a>.</p>
        </center>

        <p className="text--body2 mb-2">{t('rules_overview')}</p>
        
        <div className="d-flex g-3 mt-3">
          <Link to={"/new"} className="btn btn-primary flex-grow-1">{t("new_game")}</Link>
          <Link to={"/join"} className="btn flex-grow-1">{t("join_game")}</Link>
        </div>
      </div>
    </section>
  )
}
