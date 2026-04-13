USE BearCreatorDB;
GO

-- ─── Users Table (from User class + AuthController) ───────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
CREATE TABLE Users (
  id              VARCHAR(36)       PRIMARY KEY DEFAULT NEWID(),
  email           NVARCHAR(200)     NOT NULL UNIQUE,
  password        NVARCHAR(500)     NOT NULL,         -- hashed
  name            NVARCHAR(100)     NULL,
  phone           NVARCHAR(30)      NULL,
  address         NVARCHAR(500)     NULL,
  role            NVARCHAR(10)      NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
  is_admin        BIT               NOT NULL DEFAULT 0,
  created_at      DATETIME2         DEFAULT GETDATE()
);
GO

-- ─── Bears Table (BearConfig class) ──────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Bears' AND xtype='U')
CREATE TABLE Bears (
  id              VARCHAR(36)       PRIMARY KEY DEFAULT NEWID(),
  name            NVARCHAR(100)     NOT NULL DEFAULT 'My Bear',
  bear_type       NVARCHAR(50)      NOT NULL DEFAULT 'classic',   -- baseBear
  bear_color      NVARCHAR(20)      NOT NULL DEFAULT '#C4956A',   -- color
  clothes         NVARCHAR(50)      NULL,                          -- clothes[]
  accessories     NVARCHAR(MAX)     NULL,                          -- accessories[]
  config          NVARCHAR(MAX)     NOT NULL,                      -- full JSON config
  audio_file      NVARCHAR(500)     NULL,
  image_file      NVARCHAR(500)     NULL,
  total_price     DECIMAL(10, 2)    NOT NULL DEFAULT 0,            -- calculatePrice()
  created_at      DATETIME2         DEFAULT GETDATE(),
  updated_at      DATETIME2         DEFAULT GETDATE()
);
GO

-- ─── Orders Table (Order class — linked to User) ──────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Orders' AND xtype='U')
CREATE TABLE Orders (
  id              VARCHAR(36)       PRIMARY KEY DEFAULT NEWID(),
  user_id         VARCHAR(36)       NULL,                          -- userId: string
  bear_id         VARCHAR(36)       NULL,                          -- bearConfig: BearConfig
  voice_url       NVARCHAR(500)     NULL,                          -- voiceUrl: string
  price           DECIMAL(10, 2)    NOT NULL DEFAULT 0,            -- price: number
  status          NVARCHAR(20)      NOT NULL DEFAULT 'pending',    -- pending|paid|shipped|delivered
  customer_name   NVARCHAR(100)     NULL,
  customer_email  NVARCHAR(200)     NULL,
  shipping_addr   NVARCHAR(MAX)     NULL,
  created_at      DATETIME2         DEFAULT GETDATE(),             -- createdAt: Date
  CONSTRAINT FK_Orders_Users FOREIGN KEY (user_id)
    REFERENCES Users(id) ON DELETE SET NULL,
  CONSTRAINT FK_Orders_Bears FOREIGN KEY (bear_id)
    REFERENCES Bears(id) ON DELETE SET NULL
);
GO

-- ─── CartItems Table ──────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CartItems' AND xtype='U')
CREATE TABLE CartItems (
  id              VARCHAR(36)       PRIMARY KEY DEFAULT NEWID(),
  user_id         VARCHAR(36)       NULL,
  bear_id         VARCHAR(36)       NOT NULL,
  quantity        INT               NOT NULL DEFAULT 1,
  added_at        DATETIME2         DEFAULT GETDATE(),
  CONSTRAINT FK_CartItems_Bears FOREIGN KEY (bear_id)
    REFERENCES Bears(id) ON DELETE CASCADE,
  CONSTRAINT FK_CartItems_Users FOREIGN KEY (user_id)
    REFERENCES Users(id) ON DELETE SET NULL
);
GO

-- ─── OrderItems Table (for multi-bear orders) ────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='OrderItems' AND xtype='U')
CREATE TABLE OrderItems (
  id              VARCHAR(36)       PRIMARY KEY DEFAULT NEWID(),
  order_id        VARCHAR(36)       NOT NULL,
  bear_id         VARCHAR(36)       NOT NULL,
  quantity        INT               NOT NULL DEFAULT 1,
  unit_price      DECIMAL(10, 2)    NOT NULL,
  CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (order_id)
    REFERENCES Orders(id) ON DELETE CASCADE,
  CONSTRAINT FK_OrderItems_Bears FOREIGN KEY (bear_id)
    REFERENCES Bears(id)
);
GO

-- ─── Demo Users (from class diagram credentials) ─────────────────────────────
-- Passwords are stored as bcrypt hashes in production
-- Demo: admin@buildabear.com / admin123
-- Demo: user@test.com / password123
-- Using placeholder hashes here — the backend will hash on register

IF NOT EXISTS (SELECT * FROM Users WHERE email = 'admin@buildabear.com')
INSERT INTO Users (id, email, password, name, role, is_admin) VALUES
(
  NEWID(),
  'admin@buildabear.com',
  '$2b$10$placeholder_hash_admin',   -- replace with real bcrypt hash
  'Admin User',
  'admin',
  1
);
GO

IF NOT EXISTS (SELECT * FROM Users WHERE email = 'user@test.com')
INSERT INTO Users (id, email, password, name, role, is_admin) VALUES
(
  NEWID(),
  'user@test.com',
  '$2b$10$placeholder_hash_user',    -- replace with real bcrypt hash
  'Test User',
  'user',
  0
);
GO

-- ─── Sample Bears ────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM Bears WHERE name = 'Honey Sunshine')
INSERT INTO Bears (id, name, bear_type, bear_color, clothes, config, total_price) VALUES
(
  NEWID(), 'Honey Sunshine', 'honey', '#D4A853', 'dress_yellow',
  '{"bearType":"honey","bearColor":"#D4A853","clothes":"dress_yellow","hat":"crown","accessories":"necklace","shoes":"heels_pink","name":"Honey Sunshine","clothesColor":null}',
  89.00
);
GO

IF NOT EXISTS (SELECT * FROM Bears WHERE name = 'Mr Dapper')
INSERT INTO Bears (id, name, bear_type, bear_color, clothes, config, total_price) VALUES
(
  NEWID(), 'Mr Dapper', 'classic', '#C4956A', 'suit_black',
  '{"bearType":"classic","bearColor":"#C4956A","clothes":"suit_black","hat":"tophat","accessories":"glasses_square","shoes":"boots_black","name":"Mr Dapper","clothesColor":null}',
  95.00
);
GO

IF NOT EXISTS (SELECT * FROM Bears WHERE name = 'Arctic Puff')
INSERT INTO Bears (id, name, bear_type, bear_color, clothes, config, total_price) VALUES
(
  NEWID(), 'Arctic Puff', 'polar', '#F0EEE9', 'hoodie_gray',
  '{"bearType":"polar","bearColor":"#F0EEE9","clothes":"hoodie_gray","hat":"beanie_blue","accessories":"scarf_blue","shoes":"boots_brown","name":"Arctic Puff","clothesColor":null}',
  90.00
);
GO

PRINT 'Schema updated successfully from class diagram!';
GO
