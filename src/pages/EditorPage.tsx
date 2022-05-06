import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  VscChevronRight,
  VscFolderOpened,
  VscGist,
  VscRepoPull,
} from "react-icons/vsc";
import { useDebounce } from "use-debounce";
import useStorage from "use-local-storage-state";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor/esm/vs/editor/editor.api";
import animals from "../lib/animals.json";
import Rustpad, { UserInfo } from "../lib/rustpad";
import ConnectionStatus from "../components/ConnectionStatus";
import Footer from "../components/Footer";
import User from "../components/User";
import Score from "../components/Score";
import NewScore from "../components/NewScore";
import fluteDuetAbc from "../music/fluteDuet.abc?raw";
import fugueAbc from "../music/fugue.abc?raw";
import bartokAbc from "../music/bartok.abc?raw";
import twinkleAbc from "../music/twinkle.abc?raw";
import Split from "react-split";
import "./Split.css";

function getWsUri(id: string) {
  return (
    (window.location.origin.startsWith("https") ? "wss://" : "ws://") +
    window.location.host +
    `/api/socket/${id}`
  );
}

function generateName() {
  return "Anonymous " + animals[Math.floor(Math.random() * animals.length)];
}

function generateHue() {
  return Math.floor(Math.random() * 360);
}

function EditorPage() {
  const toast = useToast();
  const [connection, setConnection] = useState<
    "connected" | "disconnected" | "desynchronized"
  >("disconnected");
  const [users, setUsers] = useState<Record<number, UserInfo>>({});
  const [name, setName] = useStorage("name", generateName);
  const [hue, setHue] = useStorage("hue", generateHue);
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor>();
  const [darkMode, setDarkMode] = useStorage("darkMode", () => false);
  const rustpad = useRef<Rustpad>();
  const { id } = useParams<string>();

  useEffect(() => {
    if (editor?.getModel()) {
      const model = editor.getModel()!;
      model.setValue("");
      model.setEOL(0); // LF
      rustpad.current = new Rustpad({
        uri: getWsUri(id!),
        editor,
        onConnected: () => setConnection("connected"),
        onDisconnected: () => setConnection("disconnected"),
        onDesynchronized: () => {
          setConnection("desynchronized");
          toast({
            title: "Desynchronized with server",
            description: "Please save your work and refresh the page.",
            status: "error",
            duration: null,
          });
        },
        onChangeUsers: setUsers,
      });
      return () => {
        rustpad.current?.dispose();
        rustpad.current = undefined;
      };
    }
  }, [id, editor, toast, setUsers]);

  useEffect(() => {
    if (connection === "connected") {
      rustpad.current?.setInfo({ name, hue });
    }
  }, [connection, name, hue]);

  async function handleCopy() {
    await navigator.clipboard.writeText(`${window.location.origin}/${id}`);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }

  function handleDarkMode() {
    setDarkMode(!darkMode);
  }

  function handleLoadSample() {
    const samples = [fluteDuetAbc, fugueAbc, bartokAbc, twinkleAbc];

    if (editor?.getModel()) {
      const model = editor.getModel()!;
      model.pushEditOperations(
        editor.getSelections(),
        [
          {
            range: model.getFullModelRange(),
            text: samples[Math.floor(Math.random() * samples.length)],
          },
        ],
        () => null
      );
      editor.setPosition({ column: 0, lineNumber: 0 });
    }
  }

  const [text, setText] = useState("");
  const [abcString] = useDebounce(text, 100, { maxWait: 1000 });

  return (
    <Flex
      direction="column"
      h="100vh"
      overflow="hidden"
      bgColor={darkMode ? "#1e1e1e" : "white"}
      color={darkMode ? "#cbcaca" : "inherit"}
      className={darkMode ? "dark-mode" : undefined}
    >
      <Box
        flexShrink={0}
        bgColor={darkMode ? "#333333" : "#e8e8e8"}
        color={darkMode ? "#cccccc" : "#383838"}
        textAlign="center"
        fontSize="sm"
        py={0.5}
      >
        Composing Studio
      </Box>
      <Flex flex="1 0" minH={0}>
        <Container
          w="xs"
          bgColor={darkMode ? "#252526" : "#f3f3f3"}
          overflowY="auto"
          maxW="full"
          lineHeight={1.4}
          py={4}
        >
          <ConnectionStatus darkMode={darkMode} connection={connection} />

          <Flex justifyContent="space-between" mt={4} mb={1.5} w="full">
            <Heading size="sm">Dark Mode</Heading>
            <Switch isChecked={darkMode} onChange={handleDarkMode} />
          </Flex>

          <Heading mt={4} mb={1.5} size="sm">
            Share Link
          </Heading>
          <InputGroup size="sm">
            <Input
              readOnly
              pr="3.5rem"
              variant="outline"
              bgColor={darkMode ? "#3c3c3c" : "white"}
              borderColor={darkMode ? "#3c3c3c" : "white"}
              value={`${window.location.origin}/${id}`}
            />
            <InputRightElement width="3.5rem">
              <Button
                h="1.4rem"
                size="xs"
                onClick={handleCopy}
                _hover={{ bg: darkMode ? "#575759" : "gray.200" }}
                bgColor={darkMode ? "#575759" : "gray.200"}
              >
                Copy
              </Button>
            </InputRightElement>
          </InputGroup>

          <Heading mt={4} mb={1.5} size="sm">
            Active Users
          </Heading>
          <Stack spacing={0} mb={1.5} fontSize="sm">
            <User
              info={{ name, hue }}
              isMe
              onChangeName={(name) => name.length > 0 && setName(name)}
              onChangeColor={() => setHue(generateHue())}
              darkMode={darkMode}
            />
            {Object.entries(users).map(([id, info]) => (
              <User key={id} info={info} darkMode={darkMode} />
            ))}
          </Stack>

          <Heading mt={4} mb={1.5} size="sm">
            About
          </Heading>
          <Text fontSize="sm" mb={1.5}>
            <strong>Gamelan Studio</strong> is an open-source collaborative web
            application that lets people write and engrave Gamelan music
            together using the system learned in MIT's 21M.292.
          </Text>
          <Text fontSize="sm" mb={1.5}>
            All notes need at least 1 space in between eachother in order for it
            to be picked up by the music player. To switch between the supported
            instruments (Gangsa, Ugal, Jegogan), you need to add a 'g', 'u', or
            'j' respectively. A gong tone can be used at any point with a 'G'
            and a rest can be denoted with a '-'. The different instruments will
            play their notes at the same time, but notes from the same
            instrument will play sequentially.
          </Text>
          <Text fontSize="sm" mb={1.5}>
            To denote a note such as note 1, you should type a '1'. To denote a
            note such as a low 6, you should type '6*'
          </Text>
          <Text fontSize="sm" mb={1.5}>
            By updating the "Beats per Second" input with a number, you can
            change the speed at which the music is played at.
          </Text>
          <Text fontSize="sm" mb={1.5}>
            Share a link to this studio with others, and they'll be able to edit
            from their browser while seeing your changes in real time.
          </Text>
        </Container>
        <Flex flex={1} minW={0} h="100%" direction="column" overflow="hidden">
          <HStack
            h={6}
            spacing={1}
            color="#888888"
            fontWeight="medium"
            fontSize="13px"
            px={3.5}
            flexShrink={0}
          >
            <Icon as={VscFolderOpened} fontSize="md" color="blue.500" />
            <Text>documents</Text>
            <Icon as={VscChevronRight} fontSize="md" />
            <Icon as={VscGist} fontSize="md" color="purple.500" />
            <Text>{id}</Text>
          </HStack>
          <Box flex={1} minH={0} h="100%" overflow="hidden">
            <Split className="split" minSize={50}>
              <Box>
                <Editor
                  theme={darkMode ? "vs-dark" : "vs"}
                  language="abc"
                  options={{
                    automaticLayout: true,
                    fontSize: 13,
                    wordWrap: "on",
                  }}
                  onMount={(editor) => setEditor(editor)}
                  onChange={(text) => {
                    if (text !== undefined) {
                      setText(text);
                    }
                  }}
                />
              </Box>

              <Box overflowX="auto">
                <NewScore notes={abcString} darkMode={darkMode} />
              </Box>
            </Split>
          </Box>
        </Flex>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default EditorPage;
