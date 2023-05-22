import {
  ChakraProvider,
  Heading,
  Container,
  Text,
  Input,
  Button,
  Wrap,
  Stack,
  Image,
  Link,
  SkeletonCircle,
  SkeletonText,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Flex
} from "@chakra-ui/react";
import { useState } from "react";

const App = () => {
  const [image, updateImage] = useState();
  const [prompt, updatePrompt] = useState("");
  const [negPrompt, updateNegPrompt] = useState("");
  const [loading, updateLoading] = useState(false);

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [samplers, setSamplers] = useState([])
  const [models, setModels] = useState([])

  const [advancedSettings, setAdvancedSettings] = useState({
    model: "",
    samplingMethod: "",
    steps: 40,
    width: 512,
    height: 768,
    cfgScale: 5.0,
  });

  const getImage = async (prompt, negativePrompt, url) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          // This is your API key
          //authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          negative_prompt: negativePrompt,
          ...advancedSettings,
        }),
      });

      if (response.ok) {
        // Request succeeded
        const data = await response.json();
        console.log('Response data:', data);
        return data;
      } else {
        // Request failed
        console.error('Request failed:', response.status, response.statusText);
      }
    } catch (error) {
      // Error occurred during the request
      console.error('Request error:', error);
    }
  };

  const getSamplers = async (url) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          // This is your API key
          //authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          accept: 'application/json',
        }
      });

      if (response.ok) {
        // Request succeeded
        const data = await response.json();
        console.log('Response data:', data);
        return data;
      } else {
        // Request failed
        console.error('Request failed:', response.status, response.statusText);
      }
    } catch (error) {
      // Error occurred during the request
      console.error('Request error:', error);
    }
  };

  const getModels = async (url) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          // This is your API key
          //authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          accept: 'application/json',
        }
      });

      if (response.ok) {
        // Request succeeded
        const data = await response.json();
        console.log('Response data:', data);
        return data;
      } else {
        // Request failed
        console.error('Request failed:', response.status, response.statusText);
      }
    } catch (error) {
      // Error occurred during the request
      console.error('Request error:', error);
    }
  };

  const generate = async (prompt, negativePrompt) => {
    console.log(advancedSettings)
    updateLoading(true);
    const imageData = await getImage(prompt, negativePrompt, 'http://127.0.0.1:7860/sdapi/v1/txt2img');
    updateImage(imageData.images[0]);
    updateLoading(false);
  };

  const handleAdvancedSettingsChange = (e) => {
    const { name, value } = e.target;
    setAdvancedSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  return (
    <ChakraProvider>
      <Container>
        <Heading>Stable DIffusion🚀</Heading>
        <Text marginBottom={"10px"}>
          This react application leverages the model trained by Stability AI and
          Runway ML to generate images using the Stable Diffusion Deep Learning
          model. The model can be found via github here{" "}
          <Link href={"https://github.com/CompVis/stable-diffusion"}>
            Github Repo
          </Link>
        </Text>

        <Wrap marginBottom={"10px"}>
          <Input
            value={prompt}
            onChange={(e) => updatePrompt(e.target.value)}
            width={"350px"}
            placeholder="Prompt"
          ></Input>
          <Input
            value={negPrompt}
            onChange={(e) => updateNegPrompt(e.target.value)}
            width={"350px"}
            placeholder="Negative Prompt"
          ></Input>
          <Button onClick={(e) => generate(prompt, negPrompt)} colorScheme={"yellow"}>
            Generate
          </Button>
        </Wrap>

        <Flex alignItems="center" marginBottom="10px">
          <Text marginRight="10px" fontWeight="bold">
            Advanced Settings
          </Text>
          <Switch
            colorScheme="teal"
            isChecked={showAdvancedSettings}
            onChange={async () => {
              setShowAdvancedSettings(!showAdvancedSettings);
              if (samplers.length === 0) {
                const list_samplers = await getSamplers('http://127.0.0.1:7860/sdapi/v1/samplers');
                const list_models = await getModels('http://127.0.0.1:7860/sdapi/v1/sd-models');
                setSamplers(list_samplers);
                setModels(list_models)
                setAdvancedSettings((prevSettings) => ({
                  ...prevSettings,
                  model: list_models[0].model_name,
                  samplingMethod: list_samplers[0].name,
                }));
                
              }
            }}
          />
        </Flex>
        {showAdvancedSettings && (
          <>
            <Flex alignItems="center" marginBottom="10px">
              <FormControl marginBottom={"10px"}  marginRight={"10px"}>
                <FormLabel>Model</FormLabel>
                <Select
                  name="model"
                  value={advancedSettings.sd_model}
                  onChange={handleAdvancedSettingsChange}
                  width={"250px"}
                >
                  {models.map((model) => (
                    <option key={model.model_name} value={model.model_name}>
                      {model.model_name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl marginBottom={"10px"}>
                <FormLabel>Sampling Method</FormLabel>
                <Select
                  name="samplingMethod"
                  value={advancedSettings.samplingMethod}
                  onChange={handleAdvancedSettingsChange}
                  width={"200px"}
                >
                  {samplers.map((method) => (
                    <option key={method.name} value={method.name}>
                      {method.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Flex>

            <Flex alignItems="center" marginBottom="10px">

              <FormControl marginBottom={"10px"}>
                <FormLabel>Width</FormLabel>
                <Input
                  name="width"
                  value={advancedSettings.width}
                  onChange={handleAdvancedSettingsChange}
                  placeholder="Width"
                  width={"100px"}
                />
              </FormControl>
              <FormControl marginBottom={"10px"}>
                <FormLabel>Height</FormLabel>
                <Input
                  name="height"
                  value={advancedSettings.height}
                  onChange={handleAdvancedSettingsChange}
                  placeholder="Height"
                  width={"100px"}
                />
              </FormControl>
              <FormControl marginBottom={"10px"}>
                <FormLabel>CFG Scale</FormLabel>
                <Input
                  name="cfgScale"
                  value={advancedSettings.cfgScale}
                  onChange={handleAdvancedSettingsChange}
                  placeholder="CFG Scale"
                  width={"100px"}
                />
              </FormControl>

              <FormControl marginBottom={"10px"}>
                <FormLabel>Steps</FormLabel>
                <Input
                  name="steps"
                  value={advancedSettings.steps}
                  onChange={handleAdvancedSettingsChange}
                  placeholder="Steps"
                  width={"100px"}
                />
              </FormControl>
            </Flex>
          </>
        )}

        {loading ? (
          <Stack>
            <SkeletonCircle />
            <SkeletonText />
          </Stack>
        ) : image ? (
          <Image src={`data:image/png;base64,${image}`} boxShadow="lg" />
        ) : null}
      </Container>
    </ChakraProvider>);
};

export default App;