-- Migration: Add Collaboration Notification Triggers
-- Purpose: Automatically create notifications when collaboration requests are created or responded to

-- ============================================
-- Trigger function for collaboration request notifications
-- ============================================

CREATE OR REPLACE FUNCTION handle_collaboration_request_notification()
RETURNS trigger AS $$
DECLARE
  sender_name TEXT;
  recipient_name TEXT;
  type_label TEXT;
  notification_title TEXT;
  notification_body TEXT;
  target_user_id UUID;
  notification_type_value notification_type;
BEGIN
  -- Determine the human-readable type label
  IF NEW.type = 'coffee_chat' THEN
    type_label := 'coffee chat';
  ELSE
    type_label := 'collaboration proposal';
  END IF;

  -- ON INSERT: Notify the recipient about the new request
  IF TG_OP = 'INSERT' THEN
    -- Get sender name
    SELECT COALESCE(full_name, 'Someone') INTO sender_name
    FROM profiles WHERE id = NEW.sender_id;

    notification_title := sender_name || ' sent you a ' || type_label || ' request';
    notification_body := NEW.subject;
    target_user_id := NEW.recipient_id;
    notification_type_value := 'new_collaboration_request';

    INSERT INTO notifications (user_id, type, title, body, reference_type, reference_id, metadata)
    VALUES (
      target_user_id,
      notification_type_value,
      notification_title,
      notification_body,
      'collaboration_request',
      NEW.id::text,
      jsonb_build_object('sender_id', NEW.sender_id, 'type', NEW.type::text, 'link', '/experts')
    );

    RETURN NEW;
  END IF;

  -- ON UPDATE: Notify the sender when status changes to accepted or declined
  IF TG_OP = 'UPDATE' THEN
    -- Only trigger on status change
    IF OLD.status = NEW.status THEN
      RETURN NEW;
    END IF;

    -- Get recipient name (the expert who responded)
    SELECT COALESCE(full_name, 'Someone') INTO recipient_name
    FROM profiles WHERE id = NEW.recipient_id;

    IF NEW.status = 'accepted' THEN
      notification_title := recipient_name || ' accepted your ' || type_label || ' request';
      notification_body := NEW.response_message;
      target_user_id := NEW.sender_id;
      notification_type_value := 'collaboration_accepted';

      INSERT INTO notifications (user_id, type, title, body, reference_type, reference_id, metadata)
      VALUES (
        target_user_id,
        notification_type_value,
        notification_title,
        notification_body,
        'collaboration_request',
        NEW.id::text,
        jsonb_build_object('recipient_id', NEW.recipient_id, 'type', NEW.type::text, 'link', '/experts')
      );

    ELSIF NEW.status = 'declined' THEN
      notification_title := recipient_name || ' declined your ' || type_label || ' request';
      notification_body := NEW.response_message;
      target_user_id := NEW.sender_id;
      notification_type_value := 'collaboration_declined';

      INSERT INTO notifications (user_id, type, title, body, reference_type, reference_id, metadata)
      VALUES (
        target_user_id,
        notification_type_value,
        notification_title,
        notification_body,
        'collaboration_request',
        NEW.id::text,
        jsonb_build_object('recipient_id', NEW.recipient_id, 'type', NEW.type::text, 'link', '/experts')
      );
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Create trigger on collaboration_requests
-- ============================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS collaboration_request_notification_trigger ON collaboration_requests;

-- Create the trigger for INSERT and UPDATE
CREATE TRIGGER collaboration_request_notification_trigger
  AFTER INSERT OR UPDATE ON collaboration_requests
  FOR EACH ROW EXECUTE FUNCTION handle_collaboration_request_notification();

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON FUNCTION handle_collaboration_request_notification() IS 'Creates notifications when collaboration requests are created, accepted, or declined';
