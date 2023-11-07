import {
  ActionIcon,
  Button,
  Modal,
  Stack,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlaylistAdd, IconPlus } from "@tabler/icons-react";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useState } from "react";
import { db } from "../db";

export function CreatePromptModal({
  content,
  chatId,
}: {
  content?: string;
  chatId?: string;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const [systemValue, setSystemValue] = useState("");

  const getSystemPrompt = useCallback(async () => {
    if (!chatId) return;
    const message = await db.messages
      .where({ chatId: chatId, role: "system" })
      .first();
    if (message) {
      setSystemValue(message.content);
      return;
    }
  }, [chatId]);
  useEffect(() => {
    getSystemPrompt().catch((e) => console.error(e));
    setValue(content ?? "");
  }, [content]);

  return (
    <>
      {content ? (
        <Tooltip label="Save Prompt" position="left">
          <ActionIcon onClick={open}>
            <IconPlaylistAdd opacity={0.5} size={20} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Button fullWidth onClick={open} leftIcon={<IconPlus size={20} />}>
          New Prompt
        </Button>
      )}
      <Modal opened={opened} onClose={close} title="Create Prompt" size="lg">
        <form
          onSubmit={async (event) => {
            try {
              setSubmitting(true);
              event.preventDefault();
              const id = nanoid();
              db.prompts.add({
                id,
                title,
                content: value,
                createdAt: new Date(),
                system: systemValue,
              });
              notifications.show({
                title: "Saved",
                message: "Prompt created",
              });
              close();
            } catch (error: any) {
              if (error.toJSON().message === "Network Error") {
                notifications.show({
                  title: "Error",
                  color: "red",
                  message: "No internet connection.",
                });
              }
              const message = error.response?.data?.error?.message;
              if (message) {
                notifications.show({
                  title: "Error",
                  color: "red",
                  message,
                });
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Stack>
            <TextInput
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
              formNoValidate
              data-autofocus
            />
            <Textarea
              label="System"
              autosize
              minRows={5}
              maxRows={10}
              value={systemValue}
              onChange={(event) => setSystemValue(event.currentTarget.value)}
            />
            <Textarea
              label="Content"
              autosize
              minRows={5}
              maxRows={10}
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
            />
            <Button type="submit" loading={submitting}>
              Save
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
