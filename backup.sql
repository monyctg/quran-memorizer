--
-- PostgreSQL database dump
--

\restrict YzfvR7EfGRf3SGj7wv5ZwenmyeHvhmCD2zXd2IvUwcRBPh9nvCHMZUPRI4StUpy

-- Dumped from database version 17.7 (bdc8956)
-- Dumped by pg_dump version 17.7 (Debian 17.7-3.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: learning_mode; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.learning_mode AS ENUM (
    'sequential',
    'reverse',
    'select'
);


ALTER TYPE public.learning_mode OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_progress (
    id integer NOT NULL,
    user_id text NOT NULL,
    last_updated timestamp without time zone DEFAULT now(),
    learning_mode public.learning_mode DEFAULT 'sequential'::public.learning_mode,
    current_surah_id integer DEFAULT 1,
    current_ayah integer DEFAULT 1,
    completed_ayahs_today integer DEFAULT 0,
    day_number integer DEFAULT 1
);


ALTER TABLE public.user_progress OWNER TO neondb_owner;

--
-- Name: user_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_progress_id_seq OWNER TO neondb_owner;

--
-- Name: user_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_progress_id_seq OWNED BY public.user_progress.id;


--
-- Name: user_progress id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_progress ALTER COLUMN id SET DEFAULT nextval('public.user_progress_id_seq'::regclass);


--
-- Data for Name: user_progress; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_progress (id, user_id, last_updated, learning_mode, current_surah_id, current_ayah, completed_ayahs_today, day_number) FROM stdin;
1	test_user_1	2025-12-19 17:22:58.675	sequential	1	1	0	1
8	user_374cjO5dXFeakvAfZ5zL6FvA5mS	2025-12-23 00:56:21.612	sequential	92	7	0	4
\.


--
-- Name: user_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_progress_id_seq', 8, true);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict YzfvR7EfGRf3SGj7wv5ZwenmyeHvhmCD2zXd2IvUwcRBPh9nvCHMZUPRI4StUpy

