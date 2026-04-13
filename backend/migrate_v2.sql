USE BearCreatorDB;
GO

-- Add 'clothes' column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Bears') AND name = 'clothes')
BEGIN
  ALTER TABLE Bears ADD clothes NVARCHAR(50) NULL;
  PRINT 'Added column: clothes';
END
GO

-- Add 'accessories' column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Bears') AND name = 'accessories')
BEGIN
  ALTER TABLE Bears ADD accessories NVARCHAR(MAX) NULL;
  PRINT 'Added column: accessories';
END
GO

-- Add 'user_id' to Orders if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'user_id')
BEGIN
  ALTER TABLE Orders ADD user_id VARCHAR(36) NULL;
  PRINT 'Added column: Orders.user_id';
END
GO

-- Add 'user_id' to CartItems if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CartItems') AND name = 'user_id')
BEGIN
  ALTER TABLE CartItems ADD user_id VARCHAR(36) NULL;
  PRINT 'Added column: CartItems.user_id';
END
GO

-- Add 'bear_id' to Orders if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'bear_id')
BEGIN
  ALTER TABLE Orders ADD bear_id VARCHAR(36) NULL;
  PRINT 'Added column: Orders.bear_id';
END
GO

-- Add 'voice_url' to Orders if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'voice_url')
BEGIN
  ALTER TABLE Orders ADD voice_url NVARCHAR(500) NULL;
  PRINT 'Added column: Orders.voice_url';
END
GO

-- Add 'price' to Orders if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'price')
BEGIN
  ALTER TABLE Orders ADD price DECIMAL(10,2) NOT NULL DEFAULT 0;
  PRINT 'Added column: Orders.price';
END
GO

-- Now re-run the sample bear inserts with the clothes column
IF NOT EXISTS (SELECT * FROM Bears WHERE name = 'Honey Sunshine')
INSERT INTO Bears (id, name, bear_type, bear_color, clothes, config, total_price) VALUES
( NEWID(), 'Honey Sunshine', 'honey', '#D4A853', 'dress_yellow',
  '{"bearType":"honey","bearColor":"#D4A853","clothes":"dress_yellow","hat":"crown","accessories":"necklace","shoes":"heels_pink","name":"Honey Sunshine","clothesColor":null}',
  89.00 );
GO

IF NOT EXISTS (SELECT * FROM Bears WHERE name = 'Mr Dapper')
INSERT INTO Bears (id, name, bear_type, bear_color, clothes, config, total_price) VALUES
( NEWID(), 'Mr Dapper', 'classic', '#C4956A', 'suit_black',
  '{"bearType":"classic","bearColor":"#C4956A","clothes":"suit_black","hat":"tophat","accessories":"glasses_square","shoes":"boots_black","name":"Mr Dapper","clothesColor":null}',
  95.00 );
GO

IF NOT EXISTS (SELECT * FROM Bears WHERE name = 'Arctic Puff')
INSERT INTO Bears (id, name, bear_type, bear_color, clothes, config, total_price) VALUES
( NEWID(), 'Arctic Puff', 'polar', '#F0EEE9', 'hoodie_gray',
  '{"bearType":"polar","bearColor":"#F0EEE9","clothes":"hoodie_gray","hat":"beanie_blue","accessories":"scarf_blue","shoes":"boots_brown","name":"Arctic Puff","clothesColor":null}',
  90.00 );
GO

-- Verify everything looks correct
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN ('Bears', 'Orders', 'CartItems', 'Users')
ORDER BY TABLE_NAME, ORDINAL_POSITION;
GO

PRINT 'Migration complete!';
GO
