-- Create table for storing users
create table public.users (
  id bigint generated always as identity primary key,
  telegram_user_id bigint not null unique,
  username text,
  first_seen_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_seen_at timestamp with time zone default timezone('utc'::text, now()) not null,
  message_count int default 0
);

-- Create table for storing messages
create table public.messages (
  id bigint generated always as identity primary key,
  telegram_message_id bigint not null,
  user_id bigint references public.users(telegram_user_id),
  chat_id bigint not null,
  content text, -- optional, if we want to store message content
  sentiment_score int default 0, -- +1, 0, -1
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for faster querying of recent messages (momentum)
create index messages_created_at_idx on public.messages(created_at);
