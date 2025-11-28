import React from "react";
import styles from "./page.module.css";
import { FaTools, FaTruckLoading, FaChartBar, FaStore } from "react-icons/fa";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Metalúrgica Leoncio</h1>
        <p className={styles.subtitle}>
          Sistema de gestão para mecânica, metalúrgica, estoque e pregões.
        </p>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <FaStore className={styles.icon} />
          <h3>Estoque</h3>
          <p>Controle completo de peças, entradas e saídas.</p>
        </div>

        <div className={styles.card}>
          <FaTruckLoading className={styles.icon} />
          <h3>Pregões</h3>
          <p>Monitoramento e estratégia para licitações.</p>
        </div>

        <div className={styles.card}>
          <FaTools className={styles.icon} />
          <h3>Serviços</h3>
          <p>Registros de manutenção e operações internas.</p>
        </div>

        <div className={styles.card}>
          <FaChartBar className={styles.icon} />
          <h3>Relatórios</h3>
          <p>Faturamento e dados essenciais da operação.</p>
        </div>
      </div>
    </div>
  );
}
