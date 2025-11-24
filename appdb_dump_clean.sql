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
-- Name: get_audit_logs(text); Type: FUNCTION; Schema: public; Owner: app
--

CREATE FUNCTION public.get_audit_logs(p_role text) RETURNS TABLE(id integer, user_id integer, action text, target_table text, target_id integer, details text, log_time timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    IF p_role = 'admin' THEN
        RETURN QUERY
        SELECT
            a.id,
            a.user_id,
            a.action::text,
            a.target_table::text,
            a.target_id,
            a.details::text,
            a.timestamp
        FROM audit_logs a;
    ELSE
        RAISE EXCEPTION 'Access denied: only admin can view audit logs';
    END IF;
END;
$$;


ALTER FUNCTION public.get_audit_logs(p_role text) OWNER TO app;

--
-- Name: log_ticket_changes(); Type: FUNCTION; Schema: public; Owner: app
--

CREATE FUNCTION public.log_ticket_changes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO audit_logs (user_id, action, target_table, target_id, details)
    VALUES (NEW.created_by, TG_OP, 'tickets', NEW.id, 'Ticket changed');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_ticket_changes() OWNER TO app;

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
    details,
    timestamp  -- 추가
  )
  VALUES (
    NEW.changed_by,
    '티켓 상태 변경',
    'ticket_transitions',
    NEW.ticket_id,
    CONCAT('상태 "', NEW.from_status, '"에서 "', NEW.to_status, '"로 변경됨'),
    now()  -- 현재 시간 입력
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
    target_table character varying(100),
    target_id integer,
    details text,
    "timestamp" timestamp with time zone DEFAULT now(),
    session_id character varying(200),
    ip_address character varying(100),
    user_agent character varying(255),
    changed_fields text,
    target_department_id integer
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
-- Name: departments; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.departments OWNER TO app;

--
-- Name: users; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying NOT NULL,
    role_id integer NOT NULL,
    department_id integer,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO app;

--
-- Name: department_user_count; Type: VIEW; Schema: public; Owner: app
--

CREATE VIEW public.department_user_count AS
 SELECT d.name AS department_name,
    count(u.id) AS user_count
   FROM (public.departments d
     LEFT JOIN public.users u ON ((u.department_id = d.id)))
  GROUP BY d.name
  ORDER BY d.name;


ALTER VIEW public.department_user_count OWNER TO app;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO app;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: masked_users; Type: VIEW; Schema: public; Owner: app
--

CREATE VIEW public.masked_users AS
 SELECT id,
    username,
    concat("substring"((email)::text, 1, 3), '***@***') AS masked_email,
    role_id
   FROM public.users;


ALTER VIEW public.masked_users OWNER TO app;

--
-- Name: pii_tokens; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.pii_tokens (
    id integer NOT NULL,
    real_data text,
    token character varying,
    created_at timestamp without time zone
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
    name character varying(50) NOT NULL,
    hierarchy_level integer NOT NULL,
    description character varying(200)
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
    triggered_at timestamp without time zone,
    resolved boolean
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
    priority character varying(20) NOT NULL,
    response_time_days integer NOT NULL,
    resolve_time_days integer NOT NULL
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
    changed_at timestamp without time zone,
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
    title character varying(200) NOT NULL,
    description text,
    status character varying(50),
    priority character varying(20),
    created_by integer,
    assigned_to integer,
    sla_policy_id integer,
    department_id integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);

ALTER TABLE ONLY public.tickets FORCE ROW LEVEL SECURITY;


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
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


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

COPY public.audit_logs (id, user_id, action, target_table, target_id, details, "timestamp", session_id, ip_address, user_agent, changed_fields, target_department_id) FROM stdin;
1134	1	login	users	1	IP=172.18.0.1, UA=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-24 06:05:43.913726+09	\N	\N	\N	\N	\N
1135	1	INSERT	tickets	949	Ticket changed	2025-11-24 15:06:04.201095+09	\N	\N	\N	\N	\N
1136	1	create	tickets	949	title=VPN 연결 오류, priority=normal	2025-11-24 06:06:04.250047+09	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	\N
1137	3	UPDATE	tickets	2	Ticket changed	2025-11-24 15:07:23.821299+09	\N	\N	\N	\N	\N
1138	1	update	tickets	2	{'title': 'string123', 'description': 'string', 'priority': 'string', 'status': 'string'}	2025-11-24 06:07:23.839363+09	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	\N
1139	1	login	users	1	IP=172.18.0.1, UA=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-24 06:20:24.901725+09	\N	\N	\N	\N	\N
1140	1	INSERT	tickets	950	Ticket changed	2025-11-24 15:21:00.845855+09	\N	\N	\N	\N	\N
1141	1	create	tickets	950	title=VPN 연결 오류, priority=normal	2025-11-24 06:21:00.884499+09	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	\N
1142	3	UPDATE	tickets	2	Ticket changed	2025-11-24 15:21:19.387613+09	\N	\N	\N	\N	\N
1143	1	update	tickets	2	{'title': 'string', 'description': 'string', 'priority': 'string', 'status': 'string'}	2025-11-24 06:21:19.417503+09	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	\N
1144	1	login	users	1	IP=172.18.0.1, UA=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-24 06:30:01.877829+09	\N	\N	\N	\N	\N
1145	1	INSERT	tickets	951	Ticket changed	2025-11-24 15:33:22.797083+09	\N	\N	\N	\N	\N
1146	1	create	tickets	951	title=서버 업무 불가, priority=high	2025-11-24 06:33:22.844063+09	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	\N
1147	1	UPDATE	tickets	951	Ticket changed	2025-11-24 15:34:04.251179+09	\N	\N	\N	\N	\N
1148	1	update	tickets	951	{'title': '설정 변경 실패', 'description': 'string', 'priority': 'string', 'status': 'string'}	2025-11-24 06:34:04.272402+09	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	\N
1149	4	UPDATE	tickets	3	Ticket changed	2025-11-24 15:37:54.627665+09	\N	\N	\N	\N	\N
1150	3	UPDATE	tickets	2	Ticket changed	2025-11-24 15:37:54.627665+09	\N	\N	\N	\N	\N
1151	1	INSERT	tickets	952	Ticket changed	2025-11-24 15:40:44.009612+09	\N	\N	\N	\N	\N
1152	1	create	tickets	952	title=UI 오류, priority=low	2025-11-24 06:40:44.022599+09	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	\N	\N
1153	1	login	users	1	IP=172.18.0.1, UA=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-24 06:56:46.663134+09	\N	\N	\N	\N	\N
\.

\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.departments (id, name, description) FROM stdin;
1	IT운영부	\N
2	보안감사부	\N
3	고객지원부	\N
4	관리지원부	\N
5	인사·교육부	\N
6	재무·회계부	\N
7	경영기획부	\N
\.



--
-- Data for Name: pii_tokens; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.pii_tokens (id, real_data, token, created_at) FROM stdin;
1	010-1111-2222	tok_aaa	2025-11-01 00:00:00
2	010-2222-3333	tok_bbb	2025-11-02 00:00:00
3	010-3333-4444	tok_ccc	2025-11-03 00:00:00
4	010-4444-5555	tok_ddd	2025-11-03 00:00:00
5	010-5555-6666	tok_eee	2025-11-04 00:00:00
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.roles (id, name, hierarchy_level, description) FROM stdin;
1	super_admin	1	시스템 전체 관리자
2	admin	2	부서 관리자
3	manager	3	부서 책임자
4	engineer	4	기술 담당자
5	staff	5	일반 사무직
6	user	6	일반 사용자
7	auditor	7	감사용 계정
\.



--
-- Data for Name: sla_alerts; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.sla_alerts (id, ticket_id, alert_type, triggered_at, resolved) FROM stdin;
2	2	response_delay	2025-11-19 01:20:21.871052	t
3	3	resolution_delay	2025-11-18 01:20:21.871052	f
\.


--
-- Data for Name: sla_policies; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.sla_policies (id, priority, response_time_days, resolve_time_days) FROM stdin;
1	low	7	30
2	normal	5	21
3	high	3	14
4	urgent	1	7
\.


--
-- Data for Name: ticket_transitions; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.ticket_transitions (id, ticket_id, from_status, to_status, changed_by, changed_at, comment) FROM stdin;
2	2	open	in_progress	1	2025-11-24 14:08:06.311408	업무 시작
5	2	in_progress	resolved	1	2025-11-22 18:57:54.210933	응답 종료
6	2	resolved	closed	1	2025-11-24 08:36:11.647387	종료
7	3	open	in_progress	1	2025-11-24 00:03:09.468433	업무 시작
10	3	in_progress	resolved	1	2025-11-23 00:48:42.805818	응답 종료
11	3	resolved	closed	1	2025-11-23 21:00:11.845463	종료
12	949	open	in_progress	1	2025-11-18 18:45:54.551298	업무 시작
15	949	in_progress	resolved	1	2025-11-23 23:41:39.339379	응답 종료
16	949	resolved	closed	1	2025-11-24 10:03:00.706213	종료
17	950	open	in_progress	1	2025-11-20 23:04:13.738651	업무 시작
20	950	in_progress	resolved	1	2025-11-24 14:47:35.169871	응답 종료
21	950	resolved	closed	1	2025-11-23 18:04:11.482497	종료
22	951	open	in_progress	1	2025-11-20 07:20:54.55515	업무 시작
25	951	in_progress	resolved	1	2025-11-23 07:25:44.001664	응답 종료
26	951	resolved	closed	1	2025-11-24 01:23:40.369036	종료
27	952	open	in_progress	1	2025-11-18 20:09:27.672832	업무 시작
30	952	in_progress	resolved	1	2025-11-23 06:10:44.424484	응답 종료
31	952	resolved	closed	1	2025-11-24 09:14:51.078612	종료
\.



--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.tickets (id, title, description, status, priority, created_by, assigned_to, sla_policy_id, department_id, created_at, updated_at) FROM stdin;
949	VPN 연결 오류	사내망에서 VPN 연결이 되지 않습니다.	open	normal	1	1	2	1	2025-11-24 06:06:04.205748+09	2025-11-24 06:06:04.205755+09
950	VPN 연결 오류	사내망에서 VPN 연결이 되지 않습니다.	open	normal	1	1	2	1	2025-11-24 06:21:00.861272+09	2025-11-24 06:21:00.861274+09
951	설정 변경 실패	string	string	high	1	1	3	1	2025-11-24 06:33:22.810983+09	2025-11-24 06:34:04.258011+09
3	UI 오류	버튼이 동작하지 않습니다.	open	low	4	5	\N	1	2025-11-18 01:19:54.943018+09	\N
2	string	string	string	string	3	4	\N	1	2025-11-19 01:19:54.943018+09	2025-11-24 06:21:19.396989+09
952	UI 오류	버튼이 표시되지 않습니다.	open	low	1	1	1	1	2025-11-24 06:40:44.012337+09	2025-11-24 06:40:44.012342+09
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: app
--

COPY public.users (id, username, email, password_hash, role_id, department_id, is_active, created_at) FROM stdin;
3	seo	seo@example.com	test	4	1	t	2025-11-21 01:10:24.512432+09
4	park	park@example.com	test	5	3	t	2025-11-21 01:10:24.512432+09
5	lee	lee@example.com	test	6	4	t	2025-11-21 01:10:24.512432+09
6	kim	kim@example.com	test	2	1	t	2025-11-21 01:10:24.512432+09
7	user1	user1@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	2	7	t	2025-11-23 22:25:15.882524+09
8	user2	user2@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	3	2	t	2025-11-23 22:25:15.882524+09
9	user3	user3@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	5	2	t	2025-11-23 22:25:15.882524+09
10	user4	user4@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	6	3	t	2025-11-23 22:25:15.882524+09
11	user5	user5@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	6	5	t	2025-11-23 22:25:15.882524+09
12	user6	user6@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	2	7	t	2025-11-23 22:25:15.882524+09
13	user7	user7@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	6	1	t	2025-11-23 22:25:15.882524+09
14	user8	user8@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	2	2	t	2025-11-23 22:25:15.882524+09
15	user9	user9@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	5	3	t	2025-11-23 22:25:15.882524+09
16	user10	user10@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	4	2	t	2025-11-23 22:25:15.882524+09
17	user11	user11@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	6	6	t	2025-11-23 22:25:15.882524+09
18	user12	user12@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	6	7	t	2025-11-23 22:25:15.882524+09
19	user13	user13@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	4	1	t	2025-11-23 22:25:15.882524+09
20	user14	user14@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	2	3	t	2025-11-23 22:25:15.882524+09
21	user15	user15@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	5	3	t	2025-11-23 22:25:15.882524+09
22	user16	user16@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	3	2	t	2025-11-23 22:25:15.882524+09
23	user17	user17@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	5	1	t	2025-11-23 22:25:15.882524+09
24	user18	user18@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	5	5	t	2025-11-23 22:25:15.882524+09
25	user19	user19@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	5	7	t	2025-11-23 22:25:15.882524+09
26	user20	user20@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	6	1	t	2025-11-23 22:25:15.882524+09
27	user21	user21@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	3	3	t	2025-11-23 22:25:15.882524+09
28	user22	user22@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	2	2	t	2025-11-23 22:25:15.882524+09
29	user23	user23@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	4	7	t	2025-11-23 22:25:15.882524+09
30	user24	user24@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	3	1	t	2025-11-23 22:25:15.882524+09
31	user25	user25@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	4	5	t	2025-11-23 22:25:15.882524+09
32	user26	user26@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	6	1	t	2025-11-23 22:25:15.882524+09
33	user27	user27@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	5	1	t	2025-11-23 22:25:15.882524+09
34	user28	user28@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	2	1	t	2025-11-23 22:25:15.882524+09
35	user29	user29@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	4	4	t	2025-11-23 22:25:15.882524+09
36	user30	user30@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	4	2	t	2025-11-23 22:25:15.882524+09
37	user31	user31@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	5	2	t	2025-11-23 22:25:15.882524+09
38	user32	user32@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	5	2	t	2025-11-23 22:25:15.882524+09
39	user33	user33@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	5	1	t	2025-11-23 22:25:15.882524+09
40	user34	user34@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	4	4	t	2025-11-23 22:25:15.882524+09
41	user35	user35@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	2	2	t	2025-11-23 22:25:15.882524+09
42	user36	user36@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	6	6	t	2025-11-23 22:25:15.882524+09
43	user37	user37@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	3	6	t	2025-11-23 22:25:15.882524+09
44	user38	user38@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	4	1	t	2025-11-23 22:25:15.882524+09
45	user39	user39@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	6	4	t	2025-11-23 22:25:15.882524+09
46	user40	user40@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	3	6	t	2025-11-23 22:25:15.882524+09
47	user41	user41@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	6	4	t	2025-11-23 22:25:15.882524+09
48	user42	user42@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	4	3	t	2025-11-23 22:25:15.882524+09
49	user43	user43@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	6	3	t	2025-11-23 22:25:15.882524+09
50	user44	user44@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	2	2	t	2025-11-23 22:25:15.882524+09
51	user45	user45@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	6	5	t	2025-11-23 22:25:15.882524+09
52	user46	user46@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	6	1	t	2025-11-23 22:25:15.882524+09
53	user47	user47@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	5	7	t	2025-11-23 22:25:15.882524+09
54	user48	user48@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	3	1	t	2025-11-23 22:25:15.882524+09
55	user49	user49@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	4	1	t	2025-11-23 22:25:15.882524+09
56	user50	user50@example.com	$2b$12$uRs9bBfzE1q7hw3jXQDqaeM8f3R3YqKq7Oe0R6XYkt3ZKE/JmX9lm	3	5	t	2025-11-23 22:25:15.882524+09
57	testuser1	test1@example.com	$2b$12$abcdefghijklmnopqrstuv	4	4	t	2025-11-23 22:29:21.022428+09
58	testuser2	test2@example.com	$2b$12$abcdefghijklmnopqrstuv	5	6	t	2025-11-23 22:29:21.022428+09
59	testuser3	test3@example.com	$2b$12$abcdefghijklmnopqrstuv	7	5	t	2025-11-23 22:29:21.022428+09
60	testuser4	test4@example.com	$2b$12$abcdefghijklmnopqrstuv	4	4	t	2025-11-23 22:29:21.022428+09
61	testuser5	test5@example.com	$2b$12$abcdefghijklmnopqrstuv	4	6	t	2025-11-23 22:29:21.022428+09
62	testuser6	test6@example.com	$2b$12$abcdefghijklmnopqrstuv	2	2	t	2025-11-23 22:29:21.022428+09
63	testuser7	test7@example.com	$2b$12$abcdefghijklmnopqrstuv	1	2	t	2025-11-23 22:29:21.022428+09
64	testuser8	test8@example.com	$2b$12$abcdefghijklmnopqrstuv	3	5	t	2025-11-23 22:29:21.022428+09
65	testuser9	test9@example.com	$2b$12$abcdefghijklmnopqrstuv	5	2	t	2025-11-23 22:29:21.022428+09
66	testuser10	test10@example.com	$2b$12$abcdefghijklmnopqrstuv	2	5	t	2025-11-23 22:29:21.022428+09
67	testuser11	test11@example.com	$2b$12$abcdefghijklmnopqrstuv	4	1	t	2025-11-23 22:29:21.022428+09
68	testuser12	test12@example.com	$2b$12$abcdefghijklmnopqrstuv	2	5	t	2025-11-23 22:29:21.022428+09
69	testuser13	test13@example.com	$2b$12$abcdefghijklmnopqrstuv	5	1	t	2025-11-23 22:29:21.022428+09
70	testuser14	test14@example.com	$2b$12$abcdefghijklmnopqrstuv	3	4	t	2025-11-23 22:29:21.022428+09
71	testuser15	test15@example.com	$2b$12$abcdefghijklmnopqrstuv	1	5	t	2025-11-23 22:29:21.022428+09
72	testuser16	test16@example.com	$2b$12$abcdefghijklmnopqrstuv	1	4	t	2025-11-23 22:29:21.022428+09
73	testuser17	test17@example.com	$2b$12$abcdefghijklmnopqrstuv	2	4	t	2025-11-23 22:29:21.022428+09
74	testuser18	test18@example.com	$2b$12$abcdefghijklmnopqrstuv	2	6	t	2025-11-23 22:29:21.022428+09
75	testuser19	test19@example.com	$2b$12$abcdefghijklmnopqrstuv	6	3	t	2025-11-23 22:29:21.022428+09
76	testuser20	test20@example.com	$2b$12$abcdefghijklmnopqrstuv	7	7	t	2025-11-23 22:29:21.022428+09
77	testuser21	test21@example.com	$2b$12$abcdefghijklmnopqrstuv	7	6	t	2025-11-23 22:29:21.022428+09
78	testuser22	test22@example.com	$2b$12$abcdefghijklmnopqrstuv	4	7	t	2025-11-23 22:29:21.022428+09
79	testuser23	test23@example.com	$2b$12$abcdefghijklmnopqrstuv	7	7	t	2025-11-23 22:29:21.022428+09
80	testuser24	test24@example.com	$2b$12$abcdefghijklmnopqrstuv	4	7	t	2025-11-23 22:29:21.022428+09
81	testuser25	test25@example.com	$2b$12$abcdefghijklmnopqrstuv	7	1	t	2025-11-23 22:29:21.022428+09
82	testuser26	test26@example.com	$2b$12$abcdefghijklmnopqrstuv	5	2	t	2025-11-23 22:29:21.022428+09
83	testuser27	test27@example.com	$2b$12$abcdefghijklmnopqrstuv	6	5	t	2025-11-23 22:29:21.022428+09
84	testuser28	test28@example.com	$2b$12$abcdefghijklmnopqrstuv	4	3	t	2025-11-23 22:29:21.022428+09
85	testuser29	test29@example.com	$2b$12$abcdefghijklmnopqrstuv	4	2	t	2025-11-23 22:29:21.022428+09
86	testuser30	test30@example.com	$2b$12$abcdefghijklmnopqrstuv	5	3	t	2025-11-23 22:29:21.022428+09
87	testuser31	test31@example.com	$2b$12$abcdefghijklmnopqrstuv	7	6	t	2025-11-23 22:29:21.022428+09
88	testuser32	test32@example.com	$2b$12$abcdefghijklmnopqrstuv	5	4	t	2025-11-23 22:29:21.022428+09
89	testuser33	test33@example.com	$2b$12$abcdefghijklmnopqrstuv	2	6	t	2025-11-23 22:29:21.022428+09
90	testuser34	test34@example.com	$2b$12$abcdefghijklmnopqrstuv	6	2	t	2025-11-23 22:29:21.022428+09
91	testuser35	test35@example.com	$2b$12$abcdefghijklmnopqrstuv	5	2	t	2025-11-23 22:29:21.022428+09
92	testuser36	test36@example.com	$2b$12$abcdefghijklmnopqrstuv	2	5	t	2025-11-23 22:29:21.022428+09
93	testuser37	test37@example.com	$2b$12$abcdefghijklmnopqrstuv	1	6	t	2025-11-23 22:29:21.022428+09
94	testuser38	test38@example.com	$2b$12$abcdefghijklmnopqrstuv	1	3	t	2025-11-23 22:29:21.022428+09
95	testuser39	test39@example.com	$2b$12$abcdefghijklmnopqrstuv	1	6	t	2025-11-23 22:29:21.022428+09
96	testuser40	test40@example.com	$2b$12$abcdefghijklmnopqrstuv	3	1	t	2025-11-23 22:29:21.022428+09
97	testuser41	test41@example.com	$2b$12$abcdefghijklmnopqrstuv	3	4	t	2025-11-23 22:29:21.022428+09
98	testuser42	test42@example.com	$2b$12$abcdefghijklmnopqrstuv	6	7	t	2025-11-23 22:29:21.022428+09
99	testuser43	test43@example.com	$2b$12$abcdefghijklmnopqrstuv	4	7	t	2025-11-23 22:29:21.022428+09
100	testuser44	test44@example.com	$2b$12$abcdefghijklmnopqrstuv	4	4	t	2025-11-23 22:29:21.022428+09
101	testuser45	test45@example.com	$2b$12$abcdefghijklmnopqrstuv	6	5	t	2025-11-23 22:29:21.022428+09
102	testuser46	test46@example.com	$2b$12$abcdefghijklmnopqrstuv	2	3	t	2025-11-23 22:29:21.022428+09
103	testuser47	test47@example.com	$2b$12$abcdefghijklmnopqrstuv	5	6	t	2025-11-23 22:29:21.022428+09
104	testuser48	test48@example.com	$2b$12$abcdefghijklmnopqrstuv	1	7	t	2025-11-23 22:29:21.022428+09
105	testuser49	test49@example.com	$2b$12$abcdefghijklmnopqrstuv	6	3	t	2025-11-23 22:29:21.022428+09
106	testuser50	test50@example.com	$2b$12$abcdefghijklmnopqrstuv	1	1	t	2025-11-23 22:29:21.022428+09
107	testuser51	test51@example.com	$2b$12$abcdefghijklmnopqrstuv	2	1	t	2025-11-23 22:29:21.022428+09
108	testuser52	test52@example.com	$2b$12$abcdefghijklmnopqrstuv	3	6	t	2025-11-23 22:29:21.022428+09
109	testuser53	test53@example.com	$2b$12$abcdefghijklmnopqrstuv	6	5	t	2025-11-23 22:29:21.022428+09
110	testuser54	test54@example.com	$2b$12$abcdefghijklmnopqrstuv	7	4	t	2025-11-23 22:29:21.022428+09
111	testuser55	test55@example.com	$2b$12$abcdefghijklmnopqrstuv	2	1	t	2025-11-23 22:29:21.022428+09
112	testuser56	test56@example.com	$2b$12$abcdefghijklmnopqrstuv	5	7	t	2025-11-23 22:29:21.022428+09
113	testuser57	test57@example.com	$2b$12$abcdefghijklmnopqrstuv	3	7	t	2025-11-23 22:29:21.022428+09
114	testuser58	test58@example.com	$2b$12$abcdefghijklmnopqrstuv	7	2	t	2025-11-23 22:29:21.022428+09
115	testuser59	test59@example.com	$2b$12$abcdefghijklmnopqrstuv	7	1	t	2025-11-23 22:29:21.022428+09
116	testuser60	test60@example.com	$2b$12$abcdefghijklmnopqrstuv	7	5	t	2025-11-23 22:29:21.022428+09
117	testuser61	test61@example.com	$2b$12$abcdefghijklmnopqrstuv	3	3	t	2025-11-23 22:29:21.022428+09
118	testuser62	test62@example.com	$2b$12$abcdefghijklmnopqrstuv	2	4	t	2025-11-23 22:29:21.022428+09
119	testuser63	test63@example.com	$2b$12$abcdefghijklmnopqrstuv	5	6	t	2025-11-23 22:29:21.022428+09
120	testuser64	test64@example.com	$2b$12$abcdefghijklmnopqrstuv	7	5	t	2025-11-23 22:29:21.022428+09
121	testuser65	test65@example.com	$2b$12$abcdefghijklmnopqrstuv	2	6	t	2025-11-23 22:29:21.022428+09
122	testuser66	test66@example.com	$2b$12$abcdefghijklmnopqrstuv	3	1	t	2025-11-23 22:29:21.022428+09
123	testuser67	test67@example.com	$2b$12$abcdefghijklmnopqrstuv	2	4	t	2025-11-23 22:29:21.022428+09
124	testuser68	test68@example.com	$2b$12$abcdefghijklmnopqrstuv	3	1	t	2025-11-23 22:29:21.022428+09
125	testuser69	test69@example.com	$2b$12$abcdefghijklmnopqrstuv	4	5	t	2025-11-23 22:29:21.022428+09
126	testuser70	test70@example.com	$2b$12$abcdefghijklmnopqrstuv	3	4	t	2025-11-23 22:29:21.022428+09
127	testuser71	test71@example.com	$2b$12$abcdefghijklmnopqrstuv	2	5	t	2025-11-23 22:29:21.022428+09
128	testuser72	test72@example.com	$2b$12$abcdefghijklmnopqrstuv	1	3	t	2025-11-23 22:29:21.022428+09
129	testuser73	test73@example.com	$2b$12$abcdefghijklmnopqrstuv	6	7	t	2025-11-23 22:29:21.022428+09
130	testuser74	test74@example.com	$2b$12$abcdefghijklmnopqrstuv	6	6	t	2025-11-23 22:29:21.022428+09
131	testuser75	test75@example.com	$2b$12$abcdefghijklmnopqrstuv	4	7	t	2025-11-23 22:29:21.022428+09
132	testuser76	test76@example.com	$2b$12$abcdefghijklmnopqrstuv	4	5	t	2025-11-23 22:29:21.022428+09
133	testuser77	test77@example.com	$2b$12$abcdefghijklmnopqrstuv	1	7	t	2025-11-23 22:29:21.022428+09
134	testuser78	test78@example.com	$2b$12$abcdefghijklmnopqrstuv	6	3	t	2025-11-23 22:29:21.022428+09
135	testuser79	test79@example.com	$2b$12$abcdefghijklmnopqrstuv	5	7	t	2025-11-23 22:29:21.022428+09
136	testuser80	test80@example.com	$2b$12$abcdefghijklmnopqrstuv	1	2	t	2025-11-23 22:29:21.022428+09
137	testuser81	test81@example.com	$2b$12$abcdefghijklmnopqrstuv	5	5	t	2025-11-23 22:29:21.022428+09
138	testuser82	test82@example.com	$2b$12$abcdefghijklmnopqrstuv	2	4	t	2025-11-23 22:29:21.022428+09
139	testuser83	test83@example.com	$2b$12$abcdefghijklmnopqrstuv	4	2	t	2025-11-23 22:29:21.022428+09
140	testuser84	test84@example.com	$2b$12$abcdefghijklmnopqrstuv	3	6	t	2025-11-23 22:29:21.022428+09
141	testuser85	test85@example.com	$2b$12$abcdefghijklmnopqrstuv	3	5	t	2025-11-23 22:29:21.022428+09
142	testuser86	test86@example.com	$2b$12$abcdefghijklmnopqrstuv	5	6	t	2025-11-23 22:29:21.022428+09
143	testuser87	test87@example.com	$2b$12$abcdefghijklmnopqrstuv	4	6	t	2025-11-23 22:29:21.022428+09
144	testuser88	test88@example.com	$2b$12$abcdefghijklmnopqrstuv	7	7	t	2025-11-23 22:29:21.022428+09
145	testuser89	test89@example.com	$2b$12$abcdefghijklmnopqrstuv	2	4	t	2025-11-23 22:29:21.022428+09
146	testuser90	test90@example.com	$2b$12$abcdefghijklmnopqrstuv	5	1	t	2025-11-23 22:29:21.022428+09
147	testuser91	test91@example.com	$2b$12$abcdefghijklmnopqrstuv	7	5	t	2025-11-23 22:29:21.022428+09
148	testuser92	test92@example.com	$2b$12$abcdefghijklmnopqrstuv	5	2	t	2025-11-23 22:29:21.022428+09
149	testuser93	test93@example.com	$2b$12$abcdefghijklmnopqrstuv	7	7	t	2025-11-23 22:29:21.022428+09
150	testuser94	test94@example.com	$2b$12$abcdefghijklmnopqrstuv	2	4	t	2025-11-23 22:29:21.022428+09
151	testuser95	test95@example.com	$2b$12$abcdefghijklmnopqrstuv	3	3	t	2025-11-23 22:29:21.022428+09
152	testuser96	test96@example.com	$2b$12$abcdefghijklmnopqrstuv	7	4	t	2025-11-23 22:29:21.022428+09
153	testuser97	test97@example.com	$2b$12$abcdefghijklmnopqrstuv	6	7	t	2025-11-23 22:29:21.022428+09
154	testuser98	test98@example.com	$2b$12$abcdefghijklmnopqrstuv	2	4	t	2025-11-23 22:29:21.022428+09
155	testuser99	test99@example.com	$2b$12$abcdefghijklmnopqrstuv	5	3	t	2025-11-23 22:29:21.022428+09
156	testuser100	test100@example.com	$2b$12$abcdefghijklmnopqrstuv	6	1	t	2025-11-23 22:29:21.022428+09
1	capstone	capstone42@kunsan.com	$5$rounds=535000$ECNtZvdLR/xWNVNQ$2uoeDL1KRkAoqI7hXenzfR.Aqf3MaROxi/yFX4bd0w3	1	1	t	2025-11-24 00:56:53.149004+09
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1153, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.departments_id_seq', 1, false);


--
-- Name: pii_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.pii_tokens_id_seq', 5, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: sla_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.sla_alerts_id_seq', 4, true);


--
-- Name: sla_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.sla_policies_id_seq', 1, false);


--
-- Name: ticket_transitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.ticket_transitions_id_seq', 31, true);


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.tickets_id_seq', 952, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app
--

SELECT pg_catalog.setval('public.users_id_seq', 457, true);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


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
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


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
-- Name: ix_audit_logs_id; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX ix_audit_logs_id ON public.audit_logs USING btree (id);


--
-- Name: ix_departments_id; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX ix_departments_id ON public.departments USING btree (id);


--
-- Name: ix_roles_id; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX ix_roles_id ON public.roles USING btree (id);


--
-- Name: ix_sla_policies_id; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX ix_sla_policies_id ON public.sla_policies USING btree (id);


--
-- Name: ix_tickets_id; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX ix_tickets_id ON public.tickets USING btree (id);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: tickets ticket_audit_trigger; Type: TRIGGER; Schema: public; Owner: app
--

CREATE TRIGGER ticket_audit_trigger AFTER INSERT OR DELETE OR UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.log_ticket_changes();


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
-- Name: tickets tickets_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: tickets tickets_sla_policy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_sla_policy_id_fkey FOREIGN KEY (sla_policy_id) REFERENCES public.sla_policies(id);


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: tickets admin_ticket_policy; Type: POLICY; Schema: public; Owner: app
--

CREATE POLICY admin_ticket_policy ON public.tickets USING ((current_setting('app.current_role'::text, true) = 'admin'::text));


--
-- Name: tickets tester_ticket_policy; Type: POLICY; Schema: public; Owner: app
--

CREATE POLICY tester_ticket_policy ON public.tickets FOR SELECT USING ((created_by = (current_setting('app.current_user_id'::text, true))::integer));


--
-- Name: tickets; Type: ROW SECURITY; Schema: public; Owner: app
--

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO tester;


--
-- Name: TABLE departments; Type: ACL; Schema: public; Owner: app
--

GRANT SELECT ON TABLE public.departments TO tester;


--
-- Name: TABLE department_user_count; Type: ACL; Schema: public; Owner: app
--

GRANT SELECT ON TABLE public.department_user_count TO tester;


--
-- Name: TABLE masked_users; Type: ACL; Schema: public; Owner: app
--

GRANT SELECT ON TABLE public.masked_users TO tester;


--
-- Name: TABLE pii_tokens; Type: ACL; Schema: public; Owner: app
--

GRANT SELECT ON TABLE public.pii_tokens TO tester;


--
-- Name: TABLE roles; Type: ACL; Schema: public; Owner: app
--

GRANT SELECT ON TABLE public.roles TO tester;


--
-- Name: TABLE sla_alerts; Type: ACL; Schema: public; Owner: app
--

GRANT SELECT ON TABLE public.sla_alerts TO tester;


--
-- Name: TABLE sla_policies; Type: ACL; Schema: public; Owner: app
--

GRANT SELECT ON TABLE public.sla_policies TO tester;


--
-- Name: TABLE ticket_transitions; Type: ACL; Schema: public; Owner: app
--

GRANT SELECT ON TABLE public.ticket_transitions TO tester;


--
-- Name: TABLE tickets; Type: ACL; Schema: public; Owner: app
--

GRANT SELECT ON TABLE public.tickets TO tester;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: app
--

ALTER DEFAULT PRIVILEGES FOR ROLE app IN SCHEMA public GRANT SELECT ON TABLES TO tester;


--
-- PostgreSQL database dump complete
--

