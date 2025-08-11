import { Drawer, Portal, CloseButton } from "@chakra-ui/react";
import { AlignJustify } from "lucide-react";

const Sidebar = () => {
  return (
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
          <Drawer.Content css={{ backgroundColor: "#e0f7fa" }}>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default Sidebar;
