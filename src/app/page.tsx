import {
  Avatar,
  Button,
  Card,
  Input,
  InputGroup,
  Textarea,
} from "@chakra-ui/react";
import { CloseButton, Drawer, Portal } from "@chakra-ui/react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Plus } from "lucide-react";
import { AlignJustify } from "lucide-react";

export default function Home() {
  return (
    <div>
      <Drawer.Root placement={"start"}>
        <Drawer.Trigger asChild>
          <AlignJustify
            size={25}
            style={{ position: "absolute", top: "6px", left: "10px" }}
          />
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Drawer Title</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </Drawer.Body>
              <Drawer.Footer>
                <Button variant="outline">Cancel</Button>
                <Button>Save</Button>
              </Drawer.Footer>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
      <Button
        size="sm"
        variant="subtle"
        bg="#4338CA"
        color="white"
        css={{ borderRadius: "30px", margin: "100px", padding: "15px 25px" }}
      >
        保存する
      </Button>
      <InputGroup
        endElement={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Search />
            <SlidersHorizontal />
          </div>
        }
      >
        <Input
          placeholder="キーワードを入力"
          size="sm"
          color="white"
          css={{ borderRadius: "30px" }}
        />
      </InputGroup>
      <Button
        bg="#4338CA"
        css={{
          width: "70px",
          height: "70px",
          borderRadius: "50%",
        }}
      >
        <Plus color="white" />
      </Button>
      <Card.Root width="320px" bg="pink">
        <Card.Body gap="2">
          <Card.Title mt="2">メモタイトル</Card.Title>
          <Card.Description color="black">
            ここにメモの内容を入力してください。
          </Card.Description>
        </Card.Body>
        <Card.Footer justifyContent="flex-end"></Card.Footer>
      </Card.Root>
    </div>
  );
}
