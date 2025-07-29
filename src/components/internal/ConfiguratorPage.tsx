// Indica que este es un "Client Component" en Next.js.
// Se ejecuta en el navegador y puede manejar estado e interacciones del usuario.
"use client";

// --- Importaciones de librerías y componentes ---
import { zodResolver } from "@hookform/resolvers/zod"; // Permite usar un esquema de Zod para la validación en react-hook-form.
import Link from "next/link"; // Componente para la navegación del lado del cliente en Next.js.
import { type PropsWithChildren, useState } from "react"; // Tipos y hooks básicos de React.
import { type FieldPath, type UseFormReturn, useForm } from "react-hook-form"; // Hooks y tipos para manejar formularios.
import { toast } from "sonner"; // Librería para mostrar notificaciones (toasts).
import { type z } from "zod"; // Librería para definir y validar esquemas de datos.

// Importación de componentes de UI (Interfaz de Usuario) personalizados.
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button, LoadingButton } from "~/components/ui/button"; // Un botón normal y uno que muestra un estado de carga.
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Form } from "~/components/ui/form"; // Componente contenedor para el formulario de react-hook-form.
import { Separator } from "~/components/ui/separator";

// Importación de utilidades y configuraciones iniciales.
import { type PickFileResponse, initialConfiguration, pickFile, versionExpectMap } from "~/lib/configurationHelper";

// Importación de tipos de datos.
import { type ConfigurationCategory, Schema_App_Configuration } from "~/types/schema";

// Importación de "Server Actions", funciones que se ejecutan en el servidor de forma segura.
import { GenerateConfiguration, ProcessConfiguration, ProcessEnvironmentConfig } from "~/actions/configuration";

// Importación de los componentes de formulario que vimos en el archivo anterior.
import {
  APIConfigurator as ApiForm,
  EnvironmentConfigurator as EnvironmentForm,
  SiteConfigurator as SiteForm,
} from ".";

// --- Componente principal de la página del configurador ---
export default function ConfiguratorPage() {
  // Estados para controlar si los botones de "Cargar" están en estado de carga.
  const [isLoadingEnv, setIsLoadingEnv] = useState<boolean>(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(false);

  // Hook 'useForm' para inicializar y manejar todo el estado del formulario.
  const form = useForm<z.infer<typeof Schema_App_Configuration>>({
    resolver: zodResolver(Schema_App_Configuration), // Usa el esquema de Zod para validar los datos del formulario.
    defaultValues: initialConfiguration, // Establece los valores por defecto para todos los campos del formulario.
  });

  // Función para resetear los campos del formulario.
  function onReset(category: ConfigurationCategory | "all") {
    if (category === "all") {
      // Si la categoría es "all", resetea el formulario completo a sus valores iniciales.
      form.reset(initialConfiguration);
    } else {
      // Si no, resetea solo la categoría especificada (ej: "site", "api").
      form.resetField(category);
    }
    toast.success("Form reverted to initial state"); // Muestra una notificación de éxito.
  }

  // Función que se ejecuta al enviar el formulario.
  async function onFormSubmit(values: z.infer<typeof Schema_App_Configuration>) {
    const id = `download-${Date.now()}`;
    toast.loading("Generating configuration...", { id, duration: 0 }); // Muestra una notificación de carga.

    // Llama a la Server Action 'GenerateConfiguration' con los datos del formulario.
    const data = await GenerateConfiguration(values);
    if (!data.success) {
      // Si la acción falla, muestra un error.
      toast.error(data.message, { id, description: data.error });
      return;
    }

    // Si la acción tiene éxito, crea un enlace para descargar el archivo .zip generado.
    const url = URL.createObjectURL(data.data.zip);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${Date.now()}-gIndex.config.zip`; // Nombre del archivo a descargar.
    a.click(); // Simula un clic en el enlace para iniciar la descarga.

    // Limpia la URL y el elemento del DOM.
    URL.revokeObjectURL(url);
    a.remove();

    toast.success("Configuration generated", { id }); // Muestra notificación de éxito.
  }

  // Función para cargar y procesar un archivo de entorno (.env).
  async function onLoadEnv(response: PickFileResponse) {
    const id = `env-latest-${Date.now()}`;
    toast.loading("Waiting for file...", { id, duration: 0 });

    if (!response.success) {
      toast.error(response.message, {
        id,
        description: response.details.length ? (
          <pre className='w-full overflow-auto whitespace-pre-wrap font-mono text-xs'>
            {response.details.join("\n")}
          </pre>
        ) : undefined,
      });
      setIsLoadingEnv(false);
      return;
    }

    toast.loading("Processing environment file...", { id, duration: 0 });
    // Llama a la Server Action 'ProcessEnvironmentConfig' con el contenido del archivo.
    const data = await ProcessEnvironmentConfig(response.data);
    if (!data.success) {
      toast.error(data.message, {
        id,
        description: <pre className='w-full overflow-auto whitespace-pre-wrap font-mono text-xs'>{data.error}</pre>,
      });
      setIsLoadingEnv(false);
      return;
    }

    // Si tiene éxito, actualiza la sección 'environment' del formulario con los datos procesados.
    form.setValue("environment", data.data);
    toast.success(data.message, { id });
    setIsLoadingEnv(false); // Desactiva el estado de carga.
  }

  // Función para cargar y procesar un archivo de configuración (.ts).
  async function onLoadConfig(response: PickFileResponse) {
    const id = `config-${Date.now()}`;
    toast.loading("Waiting for file...", { id, duration: 0 });

    if (!response.success) {
      toast.error(response.message, {
        id,
        description: response.details.length ? (
          <pre className='w-full overflow-auto whitespace-pre-wrap font-mono text-xs'>
            {response.details.join("\n")}
          </pre>
        ) : undefined,
      });
      setIsLoadingConfig(false);
      return;
    }

    // Intenta extraer la versión del archivo de configuración usando una expresión regular.
    const loadedVersion = /version:\s*["']?(\d+\.\d+\.\d+)["']?/.exec(response.data)?.[1];
    if (!loadedVersion) {
      toast.error("Version not found in configuration file", { id });
      setIsLoadingConfig(false);
      return;
    }

    // Comprueba si la versión cargada es compatible.
    const versionGroup = Object.entries(versionExpectMap).find(([_, v]) => v.includes(loadedVersion))?.[0];
    if (!versionGroup) {
      toast.error("Version not recognized", {
        id,
        description: <pre>{`Loaded version: ${loadedVersion}, not matching any known version`}</pre>,
      });
      setIsLoadingConfig(false);
      return;
    }

    toast.loading(`Version ${loadedVersion} detected, processing...`, { id, duration: 0 });
    // Llama a la Server Action 'ProcessConfiguration' con el contenido y la versión detectada.
    const data = await ProcessConfiguration(response.data, versionGroup as "v1" | "v2" | "latest");
    if (!data.success) {
      toast.error(data.message, {
        id,
        description: <pre className='w-full overflow-auto whitespace-pre-wrap font-mono text-xs'>{data.error}</pre>,
      });
      setIsLoadingConfig(false);
      return;
    }

    // Si tiene éxito, actualiza las secciones correspondientes del formulario.
    form.setValue("api", data.data.api);
    form.setValue("site", data.data.site);
    // Es necesario establecer los arrays explícitamente para que react-hook-form los detecte correctamente.
    form.setValue("site.navbarItems", data.data.site.navbarItems);
    form.setValue("site.supports", data.data.site.supports);
    form.setValue("site.footer", data.data.site.footer);

    toast.success(data.message, { id });
    setIsLoadingConfig(false);
  }

  // --- Renderizado del componente ---
  return (
    <>
      {/* Alerta informativa sobre la personalización de temas. */}
      <Alert variant={"primary"}>
        <AlertTitle>Theme customization is removed from the configurator.</AlertTitle>
        <AlertDescription>
          You can use website like{" "}
          <Link href={"https://themes.fkaya.dev/"}>themes.fkaya.dev</Link>,{" "}
          <Link href={"https://themeshadcn.com/"}>themeshadcn.com</Link> or{" "}
          <Link href={"https://ui.jln.dev/"}>ui.jln.dev</Link> to generate theme configuration.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          {/* Título y descripción de la tarjeta */}
          <div>
            <CardTitle>Configurator</CardTitle>
            <CardDescription>Generate configurator for your index.</CardDescription>
          </div>
          {/* Contenedor de los botones de acción principales */}
          <div>
            <LoadingButton
              loading={isLoadingConfig} // El estado de carga se vincula aquí.
              onClick={() => {
                setIsLoadingConfig(true);
                // La utilidad 'pickFile' abre el selector de archivos del sistema.
                pickFile({
                  accept: ".ts", // Acepta solo archivos .ts
                  async onLoad(response) {
                    await onLoadConfig(response); // Llama a la función de procesamiento cuando se selecciona un archivo.
                  },
                });
              }}
            >
              Load Config
            </LoadingButton>
            <LoadingButton
              loading={isLoadingEnv}
              onClick={() => {
                setIsLoadingEnv(true);
                pickFile({
                  accept: ".env",
                  async onLoad(response) {
                    await onLoadEnv(response);
                  },
                });
              }}
            >
              Load Env
            </LoadingButton>
            <Button variant={"destructive"} onClick={() => onReset("all")}>
              Reset All
            </Button>
          </div>
        </CardHeader>
        <Separator className='mb-6' />
        {/* El componente Form de react-hook-form provee el contexto del formulario a sus hijos. */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <CardContent className='grid grid-cols-1 gap-8'>
              {/* Renderiza cada sección del formulario, pasándole las propiedades necesarias. */}
              <EnvironmentForm form={form} onResetField={(field) => form.resetField(field)} />
              <Separator />
              <ApiForm form={form} onResetField={(field) => form.resetField(field)} />
              <Separator />
              <SiteForm form={form} onResetField={(field) => form.resetField(field)} />
            </CardContent>
            <CardFooter>
              <LoadingButton
                size={"lg"}
                loading={form.formState.isSubmitting} // Muestra carga mientras el formulario se está enviando.
                // Deshabilita el botón si el formulario no es válido o no ha cambiado.
                disabled={!form.formState.isValid || !form.formState.isDirty}
                type='submit'
                className='w-full'
              >
                Generate Configuration
              </LoadingButton>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
}

// --- Componentes de Layout reutilizables ---

type FormColumnProps = {
  column?: number;
};
// Componente para crear un layout de columnas dinámico.
export function FormColumn({ column = 2, children }: PropsWithChildren<FormColumnProps>) {
  return (
    <div
      className='grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-[--form-column]'
      style={{ "--form-column": `repeat(${column}, minmax(0, 1fr))` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

type FormSectionProps = {
  title: string;
  description: string;
};
// Componente para renderizar una sección del formulario con título y descripción.
export function FormSection({ title, description, children }: PropsWithChildren<FormSectionProps>) {
  return (
    <div
      // Genera un ID único a partir del título para la navegación por anclas.
      id={title.toLowerCase().replace(/\s/g, "-")}
      className='group grid grid-cols-1 gap-4'
    >
      <div>
        <h2 className='text-lg font-semibold'>{title}</h2>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
      {children}
    </div>
  );
}

// Define el tipo de las propiedades que los sub-formularios (ApiForm, SiteForm, etc.) esperan recibir.
export type FormProps = {
  form: UseFormReturn<z.infer<typeof Schema_App_Configuration>>;
  onResetField?: (field: FieldPath<z.infer<typeof Schema_App_Configuration>>) => void;
};