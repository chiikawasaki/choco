import { Box, Input, InputGroup } from "@chakra-ui/react";
import { Search, SlidersHorizontal } from "lucide-react";
const Searchbar = () => {
  return (
    <Box w="300px">
      <InputGroup
        endElement={
          <Box display="flex" gap="0.5rem">
            <Search />
            <SlidersHorizontal />
          </Box>
        }
      >
        <Input
          placeholder="キーワードを入力"
          size="sm"
          color="black"
          css={{
            borderRadius: "30px",
          }}
        />
      </InputGroup>
    </Box>
  );
};
export default Searchbar;
