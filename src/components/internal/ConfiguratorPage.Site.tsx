// Indica que este es un "Client Component" en Next.js.
// Esto significa que se ejecuta en el navegador del usuario y puede usar estado (useState) e interactividad.
"use client";

// --- Importaciones de librerías y componentes ---
import Link from "next/link"; // Componente para crear enlaces de navegación en Next.js.
import { useMemo, useState } from "react"; // Hooks de React para memorizar valores y manejar estado.
import { useFieldArray } from "react-hook-form"; // Hook para manejar arrays de campos en un formulario.
import ReactMarkdown from "react-markdown"; // Componente para renderizar texto en formato Markdown.
import remarkBreaks from "remark-breaks"; // Plugin para ReactMarkdown que convierte saltos de línea en <br>.
import { toast } from "sonner"; // Función para mostrar notificaciones (toasts).
import { type z } from "zod"; // Librería para validación de esquemas (tipos de datos).

// Importación de componentes de UI (Interfaz de Usuario) personalizados de tu proyecto.
import { Button } from "~/components/ui/button"; // Componente de botón.
import { VirtualizedCombobox } from "~/components/ui/combobox.virtualized"; // Un combobox (selector con búsqueda) optimizado para listas largas.
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "~/components/ui/dialog.responsive"; // Componentes para crear un diálogo o modal responsivo.
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"; // Componentes para construir formularios.
import Icon, { IconNamesArray } from "~/components/ui/icon"; // Componente para mostrar íconos y un array con todos los nombres de íconos disponibles.
import { Input } from "~/components/ui/input"; // Componente de campo de texto.
import { Label } from "~/components/ui/label"; // Componente de etiqueta para formularios.
import { ScrollArea } from "~/components/ui/scroll-area"; // Componente para crear un área con scroll.
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"; // Componentes para un menú desplegable (selector).
import { Separator } from "~/components/ui/separator"; // Componente para una línea divisoria.
import { Textarea } from "~/components/ui/textarea"; // Componente de área de texto.

// Importaciones de contextos y utilidades personalizadas de tu proyecto.
import { useResponsive } from "~/context/responsiveContext"; // Hook personalizado para detectar si la vista es de escritorio o móvil.
import { cn, formatFooterContent } from "~/lib/utils"; // 'cn' es una utilidad para fusionar clases de CSS, 'formatFooterContent' formatea el texto del pie de página.

// Importación de tipos de datos definidos con Zod.
import { type Schema_App_Configuration } from "~/types/schema"; // Tipo de datos para el esquema de configuración de la aplicación.

// Importación de componentes de la página de configuración.
import { FormColumn, type FormProps, FormSection } from "./ConfiguratorPage"; // Componentes de layout para el formulario.

// --- Componente principal del formulario de configuración del sitio ---
// Este componente recibe 'form' (de react-hook-form) y 'onResetField' como propiedades.
export default function SiteForm({ form, onResetField }: FormProps) {
  return (
    // 'FormSection' es un contenedor para una sección del formulario, con un título y una descripción.
    <FormSection
      title='Site Configuration' // Título de la sección.
      description='Configure how your site looks and behaves' // Descripción de la sección.
    >
      {/* --- Campo para habilitar/deshabilitar el índice privado --- */}
      <FormField
        control={form.control} // Conecta este campo al controlador del formulario.
        name='site.privateIndex' // Nombre del campo en el objeto de datos del formulario.
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty} // Deshabilita el botón de reseteo si el campo no ha sido modificado.
              onFieldReset={() => {
                // Función que se ejecuta al resetear el campo.
                onResetField?.("site.privateIndex");
              }}
            >
              Private Index {/* Etiqueta del campo */}
            </FormLabel>
            <FormControl>
              {/* Componente Select (menú desplegable) */}
              <Select
                value={field.value ? "true" : "false"} // El valor del select, convertido a string.
                onValueChange={(value) => {
                  // Cuando el valor cambia, se actualiza el estado del formulario.
                  field.onChange(value === "true"); // Convierte el string "true" de vuelta a un booleano.
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select option' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='true'>Enable</SelectItem>
                  <SelectItem value='false'>Disable</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>
              {/* Descripción de ayuda para el usuario. */}
              Enable to require a password to access the site.{" "}
              <b>Make sure to set a password in the environment section.</b>
            </FormDescription>
            <FormMessage /> {/* Muestra mensajes de error si la validación falla. */}
          </FormItem>
        )}
      />
      {/* --- Campo para mostrar/ocultar el menú interno --- */}
      <FormField
        control={form.control}
        name='site.guideButton'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("site.guideButton");
              }}
            >
              Internal Menu
            </FormLabel>
            <FormControl>
              <Select
                value={field.value ? "true" : "false"}
                onValueChange={(value) => {
                  field.onChange(value === "true");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select option' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='true'>Show</SelectItem>
                  <SelectItem value='false'>Hide (Recommended)</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>Show internal menu on the navbar.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* 'FormColumn' agrupa campos en columnas para un mejor layout. */}
      <FormColumn>
        {/* --- Campo para el nombre del sitio --- */}
        <FormField
          control={form.control}
          name='site.siteName'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("site.siteName");
                }}
              >
                Site Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='My Awesome Index' // Texto de ejemplo.
                  {...field} // Pasa todas las propiedades del campo (value, onChange, etc.) al Input.
                />
              </FormControl>
              <FormDescription>Site name for meta and navbar.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* --- Campo para la plantilla del nombre del sitio --- */}
        <FormField
          control={form.control}
          name='site.siteNameTemplate'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("site.siteNameTemplate");
                }}
              >
                Site Name Template
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='%s - %t'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Template for the site name. <code className='font-semibold'>%t</code> for site name and{" "}
                <code className='font-semibold'>%s</code> for page title.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Vista previa en vivo de la plantilla del nombre del sitio --- */}
        <div className='col-span-full rounded-lg border p-4 shadow'>
          <span className='w-full text-center text-base font-semibold'>
            {(form.watch("site.siteNameTemplate") ?? "No template")
              // 'form.watch' observa los cambios en los campos en tiempo real.
              .replace("%t", form.watch("site.siteName") ?? "Apunte UDA")
              .replace("%s", "Page Title Goes Here")}
          </span>
        </div>
      </FormColumn>
      {/* --- Campo para la descripción del sitio --- */}
      <FormField
        control={form.control}
        name='site.siteDescription'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("site.siteDescription");
              }}
            >
              Site Description
            </FormLabel>
            <FormControl>
              <Textarea // Un área de texto para descripciones más largas.
                placeholder='A simple file browser for Google Drive with awesome features'
                {...field}
              />
            </FormControl>
            <FormDescription>Site description to be displayed on the metadata.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormColumn>
        {/* --- Campo para el autor del sitio --- */}
        <FormField
          control={form.control}
          name='site.siteAuthor'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("site.siteAuthor");
                }}
              >
                Site Author
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='mbaharip'
                  {...field}
                />
              </FormControl>
              <FormDescription>Site author to be displayed on the metadata, and used for the footer.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* --- Campo para el usuario de X (Twitter) --- */}
        <FormField
          control={form.control}
          name='site.twitterHandle'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("site.twitterHandle");
                }}
              >
                X (Twitter) Handle
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='mbaharip'
                  {...field}
                />
              </FormControl>
              <FormDescription>X (Twitter) handle to be used on the metadata, and for the footer.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormColumn>
      {/* --- Campo para la meta etiqueta de robots (SEO) --- */}
      <FormField
        control={form.control}
        name='site.robots'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("site.robots");
              }}
            >
              Robots Meta
            </FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              Robots meta tag for search engine.{" "}
              {/* Enlace a la documentación de Google para más información. */}
              <Link
                href={"https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#directives"}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 dark:text-blue-400'
              >
                Learn more
              </Link>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* --- Campo para el número máximo de breadcrumbs (migas de pan) --- */}
      <FormField
        control={form.control}
        name='site.breadcrumbMax'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("site.breadcrumbMax");
              }}
            >
              Max Breadcrumbs Item
            </FormLabel>
            <FormControl>
              <Input
                type='number' // Define el tipo de entrada como numérico.
                {...field}
              />
            </FormControl>
            <FormDescription>Maximum number of breadcrumbs item before it&apos;s truncated.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormColumn>
        {/* --- Campo para la duración de las notificaciones (toaster) --- */}
        <FormField
          control={form.control}
          name='site.toaster.duration'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("site.toaster.duration");
                }}
              >
                Toaster Duration
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                />
              </FormControl>
              <FormDescription>Duration in milliseconds for the toaster to be displayed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* --- Campo para la posición de las notificaciones (toaster) --- */}
        <FormField
          control={form.control}
          name='site.toaster.position'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                className='grow tablet:grow-0'
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("site.toaster.position");
                }}
              >
                Toaster Position
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select option' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='top-right'>Top Right</SelectItem>
                    <SelectItem value='top-left'>Top Left</SelectItem>
                    <SelectItem value='bottom-right'>Bottom Right</SelectItem>
                    <SelectItem value='bottom-left'>Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Position of the toaster.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Botón para probar la configuración del toaster --- */}
        <Button
          type='button' // Es de tipo 'button' para no enviar el formulario.
          className='col-span-full w-full'
          variant={"secondary"}
          onClick={() => {
            // Llama a la función 'toast.info' para mostrar una notificación de prueba.
            toast.info("This is a test toaster", {
              position: form.watch("site.toaster.position"), // Usa la posición seleccionada.
              duration: form.watch("site.toaster.duration"), // Usa la duración seleccionada.
            });
          }}
        >
          <Icon name='Megaphone' />
          Test Toaster
        </Button>
      </FormColumn>
      {/* --- Renderiza los componentes para manejar campos complejos (arrays) --- */}
      <NavbarItemsField
        form={form}
        onResetField={onResetField}
      />
      <SupportsField
        form={form}
        onResetField={onResetField}
      />
      <FooterField
        form={form}
        onResetField={onResetField}
      />
    </FormSection>
  );
}

// --- Componente para manejar los ítems de la barra de navegación ---
function NavbarItemsField({ form, onResetField }: FormProps) {
  const { isDesktop } = useResponsive(); // Hook para saber si es vista de escritorio.
  // 'useFieldArray' para manejar la lista de ítems de la barra de navegación.
  const { append, fields, remove } = useFieldArray<z.infer<typeof Schema_App_Configuration>>({
    control: form.control,
    name: "site.navbarItems", // El nombre del array en los datos del formulario.
  });

  // 'useMemo' memoriza la lista de íconos para no recalcularla en cada render.
  const iconItems = useMemo<{ label: React.ReactNode; value: string }[]>(
    () =>
      // Mapea el array de nombres de íconos a un formato que el Combobox puede usar.
      IconNamesArray.map((icon) => ({
        label: (
          <div className='inline-flex grow items-center justify-between gap-2'>
            <span className='line-clamp-1 break-all'>{icon}</span>
            <Icon
              name={icon}
              hideWrapper
              className='shrink-0'
            />
          </div>
        ),
        value: icon,
      })),
    [],
  );

  return (
    <>
      {/* Contenedor para la sección de ítems de la barra de navegación. */}
      <div className='space-y-2 rounded-lg border px-4 py-2 shadow'>
        <div className='space-y-2'>
          <div className='flex w-full items-center justify-between gap-2 tablet:w-fit tablet:justify-start'>
            <Label>Navbar Items</Label>
            {/* Botón para resetear todos los ítems de la barra de navegación a su valor por defecto. */}
            <Button
              type='button'
              variant={"ghost"}
              disabled={!form.getFieldState("site.navbarItems").isDirty}
              onClick={() => {
                onResetField?.(`site.navbarItems`);
              }}
              size={"icon"}
            >
              <Icon
                name='RefreshCcw'
                className='stroke-inherit'
              />
            </Button>
          </div>
          {/* Si no hay ítems, muestra un mensaje. */}
          {fields.length === 0 ? (
            <div className='w-full py-8 text-center text-sm font-semibold text-muted-foreground'>
              No extra navbar items, add one to show extra links on the navbar!
            </div>
          ) : (
            <>
              {/* Itera sobre cada ítem del array 'fields' para renderizar su formulario. */}
              {fields.map((field, index) => (
                <div
                  className='flex flex-col gap-4'
                  key={field.id} // 'key' es obligatorio y debe ser único para cada elemento en una lista.
                >
                  <div className='flex w-full flex-col gap-4 tablet:flex-row tablet:items-end'>
                    {/* Campo para seleccionar el ícono del ítem. */}
                    <FormField
                      control={form.control}
                      name={`site.navbarItems.${index}.icon`}
                      render={({ field }) => (
                        <FormItem disableBorder>
                          <FormLabel>Icon</FormLabel>
                          <FormControl>
                            <VirtualizedCombobox // Selector de íconos con búsqueda.
                              minWidth={isDesktop ? "300px" : "100%"}
                              maxWidth={isDesktop ? "300px" : "100%"}
                              options={iconItems}
                              searchPlaceholder='Search icon...'
                              selectedOption={field.value}
                              onSelectOption={(value) => {
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Campo para el nombre del ítem. */}
                    <FormField
                      control={form.control}
                      name={`site.navbarItems.${index}.name`}
                      render={({ field }) => (
                        <FormItem
                          disableBorder
                          className='grow'
                        >
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Navigation name'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='inline-flex w-full flex-col gap-4 tablet:flex-row tablet:items-end'>
                    {/* Campo para la URL (enlace) del ítem. */}
                    <FormField
                      control={form.control}
                      name={`site.navbarItems.${index}.href`}
                      render={({ field }) => (
                        <FormItem
                          disableBorder
                          className='grow'
                        >
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='/path/to/page'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Botón para marcar si el enlace es externo. */}
                    <FormField
                      control={form.control}
                      name={`site.navbarItems.${index}.external`}
                      render={({ field }) => (
                        <FormItem disableBorder>
                          <FormControl>
                            <Button
                              type='button'
                              variant={field.value ? "default" : "secondary"} // Cambia el estilo del botón si está activo.
                              name={field.name}
                              disabled={field.disabled}
                              onClick={() => {
                                field.onChange(!field.value); // Invierte el valor booleano al hacer clic.
                              }}
                              onBlur={field.onBlur}
                              className={cn(
                                "w-full transition tablet:w-fit",
                                field.value ? "opacity-100" : "opacity-30",
                              )}
                            >
                              External Link
                            </Button>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Botón para eliminar el ítem actual del array. */}
                  <Button
                    className='w-full'
                    type='button'
                    variant='outline-destructive'
                    onClick={() => remove(index)} // 'remove' es una función de useFieldArray.
                  >
                    <Icon name='X' />
                    Delete Item
                  </Button>
                  <Separator /> {/* Línea divisoria entre ítems. */}
                </div>
              ))}
            </>
          )}

          {/* Botón para añadir un nuevo ítem a la lista. */}
          <Button
            type='button'
            className='w-full'
            onClick={() => append({ icon: "Link", name: "New Item", href: "/new-item", external: false })} // 'append' (de useFieldArray) añade un objeto con valores por defecto.
          >
            <Icon name='Plus' />
            Add Item
          </Button>
        </div>
      </div>
    </>
  );
}

// --- Componente para manejar los enlaces de soporte/donaciones ---
// La estructura es muy similar a NavbarItemsField.
function SupportsField({ form, onResetField }: FormProps) {
  // Hook para manejar el array de enlaces de soporte.
  const { append, fields, remove } = useFieldArray<z.infer<typeof Schema_App_Configuration>>({
    control: form.control,
    name: "site.supports",
  });

  return (
    <>
      <div className='space-y-2 rounded-lg border px-4 py-2 shadow'>
        <div className='w-full space-y-2'>
          <div className='flex w-full items-center justify-between gap-2 tablet:w-fit tablet:justify-start'>
            <Label>Supports / Donations</Label>
            {/* Botón para resetear los enlaces de soporte. */}
            <Button
              type='button'
              variant={"ghost"}
              disabled={!form.getFieldState("site.supports").isDirty}
              onClick={() => {
                onResetField?.(`site.supports`);
              }}
              size={"icon"}
            >
              <Icon
                name='RefreshCcw'
                className='stroke-inherit'
              />
            </Button>
          </div>
          {/* Mensaje si no hay ítems. */}
          {fields.length === 0 ? (
            <div className='w-full py-8 text-center text-sm font-semibold text-muted-foreground'>
              No support items, add one to show supports link on the navbar!
            </div>
          ) : (
            <>
              {/* Itera sobre cada ítem para renderizar su formulario. */}
              {fields.map((field, index) => (
                <div
                  className='flex flex-col gap-4'
                  key={field.id}
                >
                  <div className='flex w-full flex-col gap-4 tablet:flex-row tablet:items-end'>
                    {/* Campo para la moneda (ej. USD, EUR). */}
                    <FormField
                      control={form.control}
                      name={`site.supports.${index}.currency`}
                      render={({ field }) => (
                        <FormItem disableBorder>
                          <FormLabel>Currency</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Currency'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Campo para el nombre del servicio (ej. Paypal, Ko-fi). */}
                    <FormField
                      control={form.control}
                      name={`site.supports.${index}.name`}
                      render={({ field }) => (
                        <FormItem
                          disableBorder
                          className='grow'
                        >
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Service name'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='inline-flex w-full flex-col gap-4 tablet:flex-row '>
                    {/* Campo para la URL del enlace de donación. */}
                    <FormField
                      control={form.control}
                      name={`site.supports.${index}.href`}
                      render={({ field }) => (
                        <FormItem
                          disableBorder
                          className='grow'
                        >
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='/path/to/page'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Botón para eliminar el ítem. */}
                  <Button
                    className='w-full'
                    type='button'
                    variant='outline-destructive'
                    onClick={() => remove(index)}
                  >
                    <Icon name='X' />
                    Delete Item
                  </Button>
                  <Separator />
                </div>
              ))}
            </>
          )}

          {/* Botón para añadir un nuevo enlace de soporte. */}
          <Button
            className='w-full'
            type='button'
            onClick={() => append({ currency: "USD", name: "Paypal", href: "https://paypal.me/acme" })}
          >
            <Icon name='Plus' />
            Add Item
          </Button>
        </div>
      </div>
    </>
  );
}

// --- Componente para manejar las líneas de texto del pie de página (footer) ---
function FooterField({ form, onResetField }: FormProps) {
  // Hook para manejar el array de líneas del footer.
  const { append, fields, remove } = useFieldArray<z.infer<typeof Schema_App_Configuration>>({
    control: form.control,
    name: "site.footer",
  });

  // Lista de plantillas (templates) disponibles para usar en el footer. Memorizada con useMemo.
  const templates = useMemo(
    () => [
      {
        code: "version",
        description: "Show current version",
      },
      {
        code: "poweredBy",
        description: 'Show "Powered by Mauricio Medina", linked to the repository',
      },
      {
        code: "year",
        description: "Show current year",
      },
      {
        code: "repository",
        description: "Original repository (mbaharip/next-gdrive-index)",
      },
      {
        code: "creator",
        description: "mbaharip, the creator of next-gdrive-index",
      },
      {
        code: "author",
        description: "Site author from configuration",
      },
      {
        code: "siteName",
        description: "Site name from configuration",
      },
      {
        code: "handle",
        description: "Twitter handle from configuration",
      },
    ],
    [],
  );
  // Estado local para almacenar el contenido del footer renderizado para la vista previa.
  const [content, setContent] = useState<string>(() => {
    // Inicializa el estado con el contenido del footer formateado.
    return formatFooterContent(form.watch("site.footer"), form.getValues("site"));
  });

  return (
    <>
      <div className='space-y-2 rounded-lg border px-4 py-2 shadow'>
        <div className='w-full space-y-4'>
          <div className='flex w-full items-center justify-between gap-2 tablet:w-fit tablet:justify-start'>
            <Label>Footer Items</Label>
            {/* Botón para resetear los ítems del footer. */}
            <Button
              type='button'
              variant={"ghost"}
              disabled={!form.getFieldState("site.footer").isDirty}
              onClick={() => {
                onResetField?.(`site.footer`);
              }}
              size={"icon"}
            >
              <Icon
                name='RefreshCcw'
                className='stroke-inherit'
              />
            </Button>
          </div>
          {/* Mensaje si no hay ítems. */}
          {fields.length === 0 ? (
            <div className='w-full py-8 text-center text-sm font-semibold text-muted-foreground'>
              No support items, add one to show supports link on the navbar!
            </div>
          ) : (
            <div className='flex flex-col gap-4'>
              {/* Itera sobre cada línea de texto del footer. */}
              {fields.map((field, index) => (
                <FormField
                  control={form.control}
                  key={field.id}
                  name={`site.footer.${index}.value`} // Cada objeto del array tiene una propiedad 'value'.
                  render={({ field }) => (
                    <FormItem disableBorder>
                      <div className='flex w-full items-center gap-4'>
                        <FormControl>
                          <Input
                            placeholder='See description for templates'
                            {...field}
                          />
                        </FormControl>
                        {/* Botón para eliminar la línea de texto. */}
                        <Button
                          type='button'
                          variant={"outline-destructive"}
                          size='icon'
                          onClick={() => {
                            remove(index);
                          }}
                        >
                          <Icon name='X' />
                        </Button>
                      </div>
                      <FormDescription className={cn(index !== fields.length - 1 && "sr-only")}>
                        {/* Solo muestra la descripción en el último ítem para no ser repetitivo. */}
                        <span className='flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between'>
                          <span>
                            Text to be displayed on the footer. <b>Markdown supported</b>
                          </span>
                          {/* Diálogo que muestra la guía de plantillas. */}
                          <ResponsiveDialog>
                            <ResponsiveDialogTrigger asChild>
                              <Button
                                type='button'
                                size='sm'
                                variant='ghost'
                                className='w-full tablet:ml-auto tablet:w-fit'
                              >
                                Click to see templates
                              </Button>
                            </ResponsiveDialogTrigger>
                            <ResponsiveDialogContent>
                              <ResponsiveDialogHeader>
                                <ResponsiveDialogTitle>Template Guide</ResponsiveDialogTitle>
                                <ResponsiveDialogDescription>
                                  Available templates for dynamic content
                                </ResponsiveDialogDescription>
                              </ResponsiveDialogHeader>
                              <ResponsiveDialogBody>
                                <ScrollArea
                                  className='h-fit w-full pr-4'
                                  type='always'
                                >
                                  <div className='flex max-h-[50dvh] flex-col gap-2'>
                                    {/* Mapea y muestra cada plantilla disponible. */}
                                    {templates.map((template) => (
                                      <div
                                        key={template.code}
                                        className='flex flex-col rounded-lg border bg-background p-2 tablet:px-4'
                                      >
                                        <span className='font-semibold'>{`{{ ${template.code} }}`}</span>
                                        <span className='text-sm text-muted-foreground'>{template.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </ResponsiveDialogBody>
                              <ResponsiveDialogFooter>
                                <ResponsiveDialogClose asChild>
                                  <Button>Close</Button>
                                </ResponsiveDialogClose>
                              </ResponsiveDialogFooter>
                            </ResponsiveDialogContent>
                          </ResponsiveDialog>
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          )}

          {/* Botón para añadir una nueva línea de texto al footer. */}
          <Button
            type='button'
            size='sm'
            className='mt-2 w-full'
            onClick={() => {
              append({ value: "" }); // Añade un objeto con un string vacío.
            }}
          >
            <Icon name='Plus' />
            Add Item
          </Button>

          <Separator />
          {/* --- Sección de vista previa (preview) del footer --- */}
          <div className='space-y-4'>
            <div className='flex w-full flex-col items-center justify-center'>
              {/* 'ReactMarkdown' renderiza el contenido del estado 'content'. */}
              <ReactMarkdown
                className='flex w-full select-none flex-col items-center justify-center text-center'
                components={{
                  // Personaliza cómo se renderizan las etiquetas HTML.
                  p: ({ children, ...props }) => (
                    <p
                      {...props}
                      className='muted text-balance text-sm'
                    >
                      {children}
                    </p>
                  ),
                  a: ({ children, ...props }) => {
                    const isExternal = props.href?.startsWith("http");

                    return (
                      <a
                        {...props}
                        className='text-balance text-sm text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                      >
                        {children}
                      </a>
                    );
                  },
                }}
                remarkPlugins={[remarkBreaks]} // Plugin para que los saltos de línea funcionen.
              >
                {content}
              </ReactMarkdown>
            </div>
            {/* Botón para recargar la vista previa manualmente. */}
            <Button
              className='w-full'
              variant={"outline"}
              size={"sm"}
              onClick={() => {
                // Llama a la función de formateo y actualiza el estado 'content'.
                setContent(formatFooterContent(form.watch("site.footer"), form.getValues("site")));
              }}
              type='button'
            >
              Reload Preview
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}