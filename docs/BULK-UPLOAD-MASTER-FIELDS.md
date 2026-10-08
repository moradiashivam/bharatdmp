# Bulk upload master fields (JSON)

Super Admin → Master Fields → **Bulk upload (JSON)** (`/admin/master-fields/bulk-upload`).

1. Download the sample JSON (or click "Fill with sample").
2. Edit it: one `{ ... }` block per field.
3. Choose the file (or paste the JSON) and click **Preview & verify**. Nothing is saved yet.
4. Check the table: green = Ready, red = Error (skipped). Warnings show new groups or unknown domains.
5. Click **Confirm and import**. Only Ready rows are imported; existing fields are never changed.

## Keys
| Key | Needed | Notes |
|---|---|---|
| field_name | required | lowercase letters/numbers/_; starts with a letter; unique |
| field_label | required | question text |
| field_type | required | field type code or name (see Field Types) |
| options | choice types | `["A","B"]` or `[{"label":"A","value":"a"}]` |
| group | optional | created automatically if missing |
| domains | optional | list of research domain names |
| required | optional | true/false |
| description, help_text, placeholder, default_value, validation | optional | text |
| min_length, max_length, min_value, max_value, display_order | optional | numbers |
| status | optional | active (default) / inactive |

See `public/samples/master-fields-sample.json` for a complete example. Max 500 fields per upload.
