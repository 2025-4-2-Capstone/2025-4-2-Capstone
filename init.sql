--
-- PostgreSQL database dump
--

-- Dumped from database version 16.0 (Debian 16.0-1.pgdg120+1)
-- Dumped by pg_dump version 16.0 (Debian 16.0-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: log_ticket_status_change(); Type: FUNCTION; Schema: public; Owner: app
--

CREATE FUNCTION public.log_ticket_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    target_table,
    target_id,
    details
  )
  VALUES (
    NEW.changed_by,
    '티켓 상태 변경',
    'ticket_transitions',
    NEW.ticket_id,
    CONCAT('상태 "', NEW.from_status, '" → "', NEW.to_status, '"로 변경됨')
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_ticket_status_change() OWNER TO app;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(100),
    target_table character varying(50),
    target_id integer,
    details text,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO app;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO app;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: pii_tokens; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.pii_tokens (
    id integer NOT NULL,
    real_data text,
    token text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pii_tokens OWNER TO app;

--
-- Name: pii_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

CREATE SEQUENCE public.pii_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pii_tokens_id_seq OWNER TO app;

--
-- Name: pii_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app
--

ALTER SEQUENCE public.pii_tokens_id_seq OWNED BY public.pii_tokens.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO app;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO app;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sla_alerts; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.sla_alerts (
    id integer NOT NULL,
    ticket_id integer,
    alert_type character varying(50),
    triggered_at timestamp without time zone DEFAULT now(),
    resolved boolean DEFAULT false
);


ALTER TABLE public.sla_alerts OWNER TO app;

--
-- Name: sla_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

CREATE SEQUENCE public.sla_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sla_alerts_id_seq OWNER TO app;

--
-- Name: sla_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app
--

ALTER SEQUENCE public.sla_alerts_id_seq OWNED BY public.sla_alerts.id;


--
-- Name: sla_policies; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.sla_policies (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    target_response_minutes integer,
    target_resolution_minutes integer
);


ALTER TABLE public.sla_policies OWNER TO app;

--
-- Name: sla_policies_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

CREATE SEQUENCE public.sla_policies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sla_policies_id_seq OWNER TO app;

--
-- Name: sla_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app
--

ALTER SEQUENCE public.sla_policies_id_seq OWNED BY public.sla_policies.id;


--
-- Name: ticket_transitions; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.ticket_transitions (
    id integer NOT NULL,
    ticket_id integer,
    from_status character varying(50),
    to_status character varying(50),
    changed_by integer,
    changed_at timestamp without time zone DEFAULT now(),
    comment text
);


ALTER TABLE public.ticket_transitions OWNER TO app;

--
-- Name: ticket_transitions_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

CREATE SEQUENCE public.ticket_transitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_transitions_id_seq OWNER TO app;

--
-- Name: ticket_transitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app
--

ALTER SEQUENCE public.ticket_transitions_id_seq OWNED BY public.ticket_transitions.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'open'::character varying,
    priority character varying(20),
    created_by integer,
    assigned_to integer,
    sla_policy_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tickets OWNER TO app;

--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tickets_id_seq OWNER TO app;

--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100),
    role_id integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO app;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO app;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: pii_tokens id; Type: DEFAULT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.pii_tokens ALTER COLUMN id SET DEFAULT nextval('public.pii_tokens_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: sla_alerts id; Type: DEFAULT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.sla_alerts ALTER COLUMN id SET DEFAULT nextval('public.sla_alerts_id_seq'::regclass);


--
-- Name: sla_policies id; Type: DEFAULT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.sla_policies ALTER COLUMN id SET DEFAULT nextval('public.sla_policies_id_seq'::regclass);


--
-- Name: ticket_transitions id; Type: DEFAULT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.ticket_transitions ALTER COLUMN id SET DEFAULT nextval('public.ticket_transitions_id_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.audit_logs (id, user_id, action, target_table, target_id, details, "timestamp") FROM stdin;
\.


--
-- Data for Name: pii_tokens; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.pii_tokens (id, real_data, token, created_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.roles (id, name) FROM stdin;
1	admin
2	operator
3	auditor
\.


--
-- Data for Name: sla_alerts; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.sla_alerts (id, ticket_id, alert_type, triggered_at, resolved) FROM stdin;
\.


--
-- Data for Name: sla_policies; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.sla_policies (id, name, description, target_response_minutes, target_resolution_minutes) FROM stdin;
1	기본 SLA	24시간 이내 응답, 72시간 이내 해결	1440	4320
2	긴급 SLA	1시간 이내 응답, 4시간 이내 해결	60	240
\.


--
-- Data for Name: ticket_transitions; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.ticket_transitions (id, ticket_id, from_status, to_status, changed_by, changed_at, comment) FROM stdin;
1	1	open	in_progress	2	2025-09-27 01:17:25.467158	조치 시작함
2	2	open	in_progress	3	2025-09-27 01:17:25.467158	로그 확인 중
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.tickets (id, title, description, status, priority, created_by, assigned_to, sla_policy_id, created_at, updated_at) FROM stdin;
1	서버 다운	메인 서버가 작동하지 않음	open	critical	1	2	2	2025-09-27 01:17:25.467158	2025-09-27 01:17:25.467158
2	로그인 오류	사용자 로그인 실패 현상	in_progress	high	2	3	1	2025-09-27 01:17:25.467158	2025-09-27 01:17:25.467158
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.users (id, username, email, role_id, created_at) FROM stdin;
1	alice	alice@example.com	1	2025-09-27 01:17:25.467158
2	bob	bob@example.com	2	2025-09-27 01:17:25.467158
3	charlie	charlie@example.com	3	2025-09-27 01:17:25.467158
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: pii_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.pii_tokens_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- Name: sla_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.sla_alerts_id_seq', 1, false);


--
-- Name: sla_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.sla_policies_id_seq', 2, true);


--
-- Name: ticket_transitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.ticket_transitions_id_seq', 2, true);


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.tickets_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: pii_tokens pii_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.pii_tokens
    ADD CONSTRAINT pii_tokens_pkey PRIMARY KEY (id);


--
-- Name: pii_tokens pii_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.pii_tokens
    ADD CONSTRAINT pii_tokens_token_key UNIQUE (token);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sla_alerts sla_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.sla_alerts
    ADD CONSTRAINT sla_alerts_pkey PRIMARY KEY (id);


--
-- Name: sla_policies sla_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.sla_policies
    ADD CONSTRAINT sla_policies_pkey PRIMARY KEY (id);


--
-- Name: ticket_transitions ticket_transitions_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.ticket_transitions
    ADD CONSTRAINT ticket_transitions_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: ticket_transitions trg_log_ticket_status_change; Type: TRIGGER; Schema: public; Owner: app
--

CREATE TRIGGER trg_log_ticket_status_change AFTER INSERT ON public.ticket_transitions FOR EACH ROW EXECUTE FUNCTION public.log_ticket_status_change();


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sla_alerts sla_alerts_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.sla_alerts
    ADD CONSTRAINT sla_alerts_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: ticket_transitions ticket_transitions_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.ticket_transitions
    ADD CONSTRAINT ticket_transitions_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- Name: ticket_transitions ticket_transitions_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.ticket_transitions
    ADD CONSTRAINT ticket_transitions_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: tickets tickets_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: tickets tickets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: tickets tickets_sla_policy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_sla_policy_id_fkey FOREIGN KEY (sla_policy_id) REFERENCES public.sla_policies(id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

