-- BearCreator Database Setup Script
-- Run this on your SQL Server instance

-- Create database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'BearCreatorDB')
BEGIN
  CREATE DATABASE BearCreatorDB;
END
GO

USE BearCreatorDB;
GO

-- Bears table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Bears' AND xtype='U')
CREATE TABLE Bears (
  id              VARCHAR(36)      PRIMARY KEY,
  name            NVARCHAR(100)    NOT NULL DEFAULT 'My Bear',
  bear_type       NVARCHAR(50)     NOT NULL DEFAULT 'classic',
  bear_color      NVARCHAR(20)     NOT NULL DEFAULT '#C4956A',
  config          NVARCHAR(MAX)    NOT NULL,        -- Full JSON config
  audio_file      NVARCHAR(500)    NULL,             -- Relative path to audio
  image_file      NVARCHAR(500)    NULL,             -- Relative path to image
  total_price     DECIMAL(10, 2)   NOT NULL DEFAULT 0,
  created_at      DATETIME2        DEFAULT GETDATE(),
  updated_at      DATETIME2        DEFAULT GETDATE()
);
GO

-- Cart Items table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CartItems' AND xtype='U')
CREATE TABLE CartItems (
  id              VARCHAR(36)      PRIMARY KEY,
  bear_id         VARCHAR(36)      NOT NULL,
  quantity        INT              NOT NULL DEFAULT 1,
  added_at        DATETIME2        DEFAULT GETDATE(),
  CONSTRAINT FK_CartItems_Bears FOREIGN KEY (bear_id)
    REFERENCES Bears(id) ON DELETE CASCADE
);
GO

-- Orders table (for checkout)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Orders' AND xtype='U')
CREATE TABLE Orders (
  id              VARCHAR(36)      PRIMARY KEY,
  customer_email  NVARCHAR(200)    NULL,
  customer_name   NVARCHAR(100)    NULL,
  total_amount    DECIMAL(10, 2)   NOT NULL,
  status          NVARCHAR(20)     NOT NULL DEFAULT 'pending',  -- pending, paid, shipped, delivered
  shipping_addr   NVARCHAR(MAX)    NULL,
  created_at      DATETIME2        DEFAULT GETDATE()
);
GO

-- Order Items
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='OrderItems' AND xtype='U')
CREATE TABLE OrderItems (
  id              VARCHAR(36)      PRIMARY KEY,
  order_id        VARCHAR(36)      NOT NULL,
  bear_id         VARCHAR(36)      NOT NULL,
  quantity        INT              NOT NULL DEFAULT 1,
  unit_price      DECIMAL(10, 2)   NOT NULL,
  CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (order_id)
    REFERENCES Orders(id) ON DELETE CASCADE,
  CONSTRAINT FK_OrderItems_Bears FOREIGN KEY (bear_id)
    REFERENCES Bears(id)
);
GO

-- Sample data
INSERT INTO Bears (id, name, bear_type, bear_color, config, total_price) VALUES
(
  NEWID(),
  'Honey Sunshine',
  'honey',
  '#D4A853',
  '{"bearType":"honey","bearColor":"#D4A853","clothes":"dress_yellow","hat":"crown","accessories":"necklace","shoes":"heels_pink","name":"Honey Sunshine","clothesColor":null}',
  89.00
),
(
  NEWID(),
  'Mr. Dapper',
  'classic',
  '#C4956A',
  '{"bearType":"classic","bearColor":"#C4956A","clothes":"suit_black","hat":"tophat","accessories":"glasses_square","shoes":"boots_black","name":"Mr. Dapper","clothesColor":null}',
  95.00
),
(
  NEWID(),
  'Arctic Puff',
  'polar',
  '#F0EEE9',
  '{"bearType":"polar","bearColor":"#F0EEE9","clothes":"hoodie_gray","hat":"beanie_blue","accessories":"scarf_blue","shoes":"boots_brown","name":"Arctic Puff","clothesColor":null}',
  90.00
);
GO

PRINT 'BearCreatorDB setup complete!';
GO
