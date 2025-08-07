import { Button, CloseButton, Drawer, Portal } from "@chakra-ui/react";
import { Input, InputGroup } from "@chakra-ui/react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Plus } from "lucide-react";
import { AlignJustify } from "lucide-react";

export default function Home() {
  return (
    <div>
      <AlignJustify
        size={25}
        style={{ position: "absolute", top: "6px", left: "10px" }}
      />
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
    </div>
  );
}
