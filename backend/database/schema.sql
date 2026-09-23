-- =============================================================================
-- Corta Aí — Script de criação do banco de dados (MySQL 8 / MariaDB 10.4+)
--
-- Como usar:
--   • phpMyAdmin (XAMPP): aba "Importar" → escolha este arquivo → Executar
--   • ou pelo terminal:   php backend/database/setup.php
--
-- O script é seguro para rodar mais de uma vez (não apaga dados existentes).
-- =============================================================================

CREATE DATABASE IF NOT EXISTS corta_ai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE corta_ai;

-- -----------------------------------------------------------------------------
-- Usuários do sistema (RF-01 / RF-02)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(80)  NOT NULL,
  email       VARCHAR(120) NOT NULL,
  telefone    VARCHAR(15)  NOT NULL,
  senha_hash  VARCHAR(255) NOT NULL COMMENT 'password_hash() do PHP (bcrypt) — nunca a senha pura',
  criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario_email (email)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Sessões de login (token enviado pelo front-end no cabeçalho Authorization)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessao (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id  INT UNSIGNED NOT NULL,
  token_hash  CHAR(64)     NOT NULL COMMENT 'SHA-256 do token (o token puro fica só com o usuário)',
  expira_em   DATETIME     NOT NULL,
  criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sessao_token (token_hash),
  KEY idx_sessao_usuario (usuario_id),
  CONSTRAINT fk_sessao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Categorias = origem das entradas / destino das saídas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categoria (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id  INT UNSIGNED NOT NULL,
  nome        VARCHAR(30)  NOT NULL,
  tipo        ENUM('entrada', 'saida') NOT NULL,
  cor         CHAR(7)      NOT NULL DEFAULT '#10b981',
  criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categoria_nome (usuario_id, tipo, nome),
  CONSTRAINT fk_categoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Movimentações: entradas (RF-03) e saídas (RF-04)
-- Valores em CENTAVOS (R$ 12,34 = 1234) para evitar erros de arredondamento.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movimentacao (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id       INT UNSIGNED NOT NULL,
  categoria_id     INT UNSIGNED NOT NULL,
  tipo             ENUM('entrada', 'saida') NOT NULL,
  descricao        VARCHAR(60)  NOT NULL,
  valor_centavos   INT UNSIGNED NOT NULL,
  data             DATE         NOT NULL,
  forma_pagamento  ENUM('dinheiro', 'pix', 'debito', 'credito', 'boleto', 'transferencia') NOT NULL,
  observacao       VARCHAR(200) NULL,
  criado_em        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_movimentacao_usuario_data (usuario_id, data),
  KEY idx_movimentacao_categoria (categoria_id),
  CONSTRAINT fk_movimentacao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
  CONSTRAINT fk_movimentacao_categoria FOREIGN KEY (categoria_id) REFERENCES categoria (id) ON DELETE RESTRICT,
  CONSTRAINT ck_movimentacao_valor CHECK (valor_centavos > 0)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Metas financeiras (RF-05)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id            INT UNSIGNED NOT NULL,
  nome                  VARCHAR(40)  NOT NULL,
  descricao             VARCHAR(120) NULL,
  valor_alvo_centavos   INT UNSIGNED NOT NULL,
  valor_atual_centavos  INT UNSIGNED NOT NULL DEFAULT 0,
  prazo                 DATE         NOT NULL,
  cor                   CHAR(7)      NOT NULL DEFAULT '#10b981',
  criado_em             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_meta_usuario (usuario_id),
  CONSTRAINT fk_meta_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
  CONSTRAINT ck_meta_valor_alvo CHECK (valor_alvo_centavos > 0)
) ENGINE=InnoDB;
