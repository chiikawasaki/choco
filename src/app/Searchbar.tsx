import { Box, Input, InputGroup } from "@chakra-ui/react";
import { Search, SlidersHorizontal } from "lucide-react";
const Searchbar = () => {
  return (
    <Box w="300px">
      <InputGroup
        endElement={
          <Box display="flex" gap="0.5rem" color="#8B6F47">
            <Search />
            <SlidersHorizontal />
          </Box>
        }
      >
        <Input
          placeholder="キーワードを入力"
          size="sm"
          color="#8B6F47"
          bg="#fefdf9"
          border="2px solid"
          borderColor="#A67B5B"
          _placeholder={{
            color: "#A67B5B",
          }}
          _hover={{
            borderColor: "#A67B5B",
            shadow: "sm",
          }}
          _focus={{
            borderColor: "#8B6F47",
            bg: "white",
            shadow: "md",
          }}
          transition="all 0.2s"
          css={{
            borderRadius: "30px",
          }}
        />
      </InputGroup>
    </Box>
  );
};
export default Searchbar;
