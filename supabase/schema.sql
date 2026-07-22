-- Rode isto no Supabase: Dashboard > SQL Editor > New query > Run.
-- Cria as tabelas da trilha. O acesso é feito só pelo servidor (service_role),
-- então habilitamos RLS sem policies: a service_role ignora RLS, e a anon key
-- (caso um dia vaze) não consegue ler nada.

create table if not exists members (
  id   text primary key,
  name text not null,
  sort integer not null default 0
);

create table if not exists progress (
  member_id text not null references members(id) on delete cascade,
  item_id   text not null,
  primary key (member_id, item_id)
);

alter table members  enable row level security;
alter table progress enable row level security;

-- Roster inicial (os mesmos nomes padrão do painel original).
-- Dá para renomear pela própria interface depois.
insert into members (id, name, sort) values
  ('d1', 'Dev 1', 1),
  ('d2', 'Dev 2', 2),
  ('d3', 'Dev 3', 3),
  ('d4', 'Dev 4', 4),
  ('d5', 'Dev 5', 5)
on conflict (id) do nothing;
