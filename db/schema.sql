CREATE DATABASE imf_gadgets;

\c imf_gadgets;

CREATE TYPE gadget_status AS ENUM ('Available', 'Deployed', 'Destroyed', 'Decommissioned');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gadgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    codename VARCHAR(255) UNIQUE NOT NULL,
    status gadget_status DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    decommissioned_at TIMESTAMP WITH TIME ZONE
);