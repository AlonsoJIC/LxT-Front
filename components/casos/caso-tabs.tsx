import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CasoAudios from "./caso-audios";
import CasoTranscripcion from "./caso-transcripcion";

export default function CasoTabs({ casoId }: { casoId: string }) {
  return (
    <Tabs defaultValue="audios">
      <TabsList>
        <TabsTrigger value="audios">Audios</TabsTrigger>
        <TabsTrigger value="transcripcion">Transcripción</TabsTrigger>
      </TabsList>
      <TabsContent value="audios">
        <CasoAudios casoId={casoId} />
      </TabsContent>
      <TabsContent value="transcripcion">
        <CasoTranscripcion casoId={casoId} />
      </TabsContent>
    </Tabs>
  );
}
