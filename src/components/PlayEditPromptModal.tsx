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
import {
  IconBookmarkEdit,
  IconEyeEdit,
  IconPencil,
  IconPlayCard,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Chat, db, Prompt } from "../db";
import { useLiveQuery } from "dexie-react-hooks";
import { nanoid } from "nanoid";
import { createStreamChatCompletion } from "../utils/openai";
import { updateChatTitle } from "../utils/chatUpdateTitle";
import { useNavigate } from "@tanstack/react-location";
import { Model, ModelChooser } from "./ModelChooser";
import { CancelToken } from "cancel-token";
import { handleChatError } from "../utils/handleChatErrors";

export function PlayEditPromptModal({
  prompt,
  onPlay,
}: {
  prompt: Prompt;
  onPlay: () => void;
}) {
  const navigate = useNavigate();

  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);
  const [model, setModel] = useState<Model>("gpt-3.5-turbo");

  const [content, setContent] = useState("");
  const apiKey = useLiveQuery(async () => {
    return (await db.settings.where({ id: "general" }).first())?.openAiApiKey;
  });

  useEffect(() => {
    setContent(prompt?.content ?? "");
  }, [prompt]);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Change content before starting chat"
        size="lg"
      >
        <form
          onSubmit={async (event) => {
            try {
              setSubmitting(true);
              event.preventDefault();
              if (!apiKey) return;
              const chatId = nanoid();
              prompt.system ??= "";
              const chat: Chat = {
                id: chatId,
                description: "New Chat",
                totalTokens: 0,
                createdAt: new Date(),
                modelUsed: model,
                totalCompletionTokens: 0,
                totalPromptTokens: 0,
                isNewChat: true,
                updatedAt: new Date(),
              };
              await db.chats.add(chat);
              await db.messages.add({
                id: nanoid(),
                chatId: chatId,
                content: prompt.system,
                role: "system",
                createdAt: new Date(),
                isGenerating: false,
              });

              await db.messages.add({
                id: nanoid(),
                chatId: chatId,
                content: content,
                role: "user",
                createdAt: new Date(),
                isGenerating: false,
              });
              let messageId = nanoid();
              await db.messages.add({
                id: messageId,
                chatId: chatId,
                content: "█",
                role: "assistant",
                createdAt: new Date(),
                isGenerating: false,
              });

              navigate({ to: `/chats/${chatId}` });
              close();
              onPlay();

              await createStreamChatCompletion(
                [
                  {
                    role: "system",
                    content: prompt.system,
                  },
                  { role: "user", content: content },
                ],
                chatId,
                messageId,
                CancelToken.source().token
              );
            } catch (error: any) {
              handleChatError(error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <ModelChooser
            value={model}
            onChange={async (newModel) => setModel(newModel)}
          ></ModelChooser>
          <Stack>
            <Textarea
              label="Content"
              autosize
              minRows={5}
              maxRows={10}
              value={content}
              onChange={(event) => setContent(event.currentTarget.value)}
            />
            <Button type="submit" loading={submitting}>
              Start Chat
            </Button>
          </Stack>
        </form>
      </Modal>
      <Tooltip label="Edit before starting chat">
        <ActionIcon size="lg" onClick={open}>
          <IconEyeEdit size={20} />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
