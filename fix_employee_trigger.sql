USE HRMS_Enterprise;
GO

-- First, drop the potentially problematic existing trigger
IF OBJECT_ID('HR.tr_AuditLog_Employees') IS NOT NULL
BEGIN
    DROP TRIGGER HR.tr_AuditLog_Employees;
    PRINT 'Dropped trigger HR.tr_AuditLog_Employees.';
END
GO

IF OBJECT_ID('System.tr_AuditLog_Employees') IS NOT NULL
BEGIN
    DROP TRIGGER System.tr_AuditLog_Employees;
    PRINT 'Dropped trigger System.tr_AuditLog_Employees.';
END
GO

-- Now, re-create the trigger correctly in the HR schema
CREATE TRIGGER HR.tr_AuditLog_Employees
ON HR.Employees
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    -- This is the critical line that prevents interference with Sequelize
    SET NOCOUNT ON;

    DECLARE @Action VARCHAR(10);

    IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
        SET @Action = 'UPDATE';
    ELSE IF EXISTS (SELECT * FROM inserted)
        SET @Action = 'INSERT';
    ELSE
        SET @Action = 'DELETE';

    INSERT INTO System.AuditLog (TableName, RecordID, Action, OldValues, NewValues, UserID, ActionDate)
    SELECT
        'HR.Employees',
        ISNULL(i.EmployeeID, d.EmployeeID),
        @Action,
        (SELECT * FROM deleted d2 WHERE d2.EmployeeID = ISNULL(i.EmployeeID, d.EmployeeID) FOR JSON AUTO),
        (SELECT * FROM inserted i2 WHERE i2.EmployeeID = ISNULL(i.EmployeeID, d.EmployeeID) FOR JSON AUTO),
        SYSTEM_USER,
        GETDATE()
    FROM inserted i
    FULL OUTER JOIN deleted d ON i.EmployeeID = d.EmployeeID;
END;
GO

PRINT 'Successfully created trigger HR.tr_AuditLog_Employees with SET NOCOUNT ON.';
GO 