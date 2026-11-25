create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  mobile_number text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.users(id) on delete cascade,
  source text not null,
  destination text not null,
  ride_date date not null,
  departure_time time not null,
  available_seats integer not null check (available_seats >= 0),
  price_per_seat integer not null check (price_per_seat >= 0),
  vehicle_name text not null,
  status text not null default 'active' check (status in ('active', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  passenger_id uuid not null references public.users(id) on delete cascade,
  requested_seats integer not null check (requested_seats >= 1),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (ride_id, passenger_id)
);

create index if not exists rides_search_idx
  on public.rides (ride_date, source, destination, status);
create index if not exists bookings_ride_idx on public.bookings (ride_id);
create index if not exists bookings_passenger_idx on public.bookings (passenger_id);

alter table public.users enable row level security;
alter table public.rides enable row level security;
alter table public.bookings enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Accepted passengers can view driver contact"
  on public.users for select
  to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      join public.rides r on r.id = b.ride_id
      where b.passenger_id = auth.uid()
        and b.status = 'accepted'
        and r.driver_id = users.id
    )
  );

create policy "Authenticated users can view active rides"
  on public.rides for select
  to authenticated
  using (status = 'active');

create policy "Drivers can insert rides"
  on public.rides for insert
  to authenticated
  with check (auth.uid() = driver_id);

create policy "Drivers can update own rides"
  on public.rides for update
  to authenticated
  using (auth.uid() = driver_id)
  with check (auth.uid() = driver_id);

create policy "Passengers can create booking requests"
  on public.bookings for insert
  to authenticated
  with check (auth.uid() = passenger_id);

create policy "Participants can view bookings"
  on public.bookings for select
  to authenticated
  using (
    auth.uid() = passenger_id
    or exists (
      select 1
      from public.rides r
      where r.id = ride_id and r.driver_id = auth.uid()
    )
  );

create policy "Drivers can update booking status"
  on public.bookings for update
  to authenticated
  using (
    exists (
      select 1
      from public.rides r
      where r.id = ride_id and r.driver_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.rides r
      where r.id = ride_id and r.driver_id = auth.uid()
    )
  );

create or replace function public.accept_booking(request_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  booking record;
  ride record;
begin
  select * into booking
  from public.bookings
  where id = request_id
  for update;

  if booking.id is null or booking.status <> 'pending' then
    return false;
  end if;

  select * into ride
  from public.rides
  where id = booking.ride_id
  for update;

  if ride.id is null
    or ride.driver_id <> auth.uid()
    or ride.status <> 'active'
    or ride.available_seats < booking.requested_seats
  then
    return false;
  end if;

  update public.rides
  set available_seats = available_seats - booking.requested_seats
  where id = ride.id;

  update public.bookings
  set status = 'accepted'
  where id = booking.id;

  return true;
end;
$$;

create or replace function public.reject_booking(request_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  booking record;
  ride record;
begin
  select * into booking
  from public.bookings
  where id = request_id
  for update;

  if booking.id is null or booking.status <> 'pending' then
    return false;
  end if;

  select * into ride
  from public.rides
  where id = booking.ride_id
  for update;

  if ride.id is null or ride.driver_id <> auth.uid() then
    return false;
  end if;

  update public.bookings
  set status = 'rejected'
  where id = booking.id;

  return true;
end;
$$;

revoke all on function public.accept_booking(uuid) from public;
revoke all on function public.reject_booking(uuid) from public;
grant execute on function public.accept_booking(uuid) to authenticated;
grant execute on function public.reject_booking(uuid) to authenticated;
