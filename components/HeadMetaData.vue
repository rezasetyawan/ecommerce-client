<script setup lang="ts">
const config = useRuntimeConfig();

interface Props {
    title?: string;
    metaDescription?: string;
    ogImageUrl?: string;
    pathname?: string;
}

const props = withDefaults(defineProps<Props>(), {
    title: "Home",
    metaDescription: "Get your wanted product :D",
    ogImageUrl:
        "https://cdn.discordapp.com/attachments/1158737649000001568/1176079653379784804/Ini_Toko.png?ex=656d9087&is=655b1b87&hm=12e512ce03ce4103e89b6c45e237b6527772a3405524bc9753b161c9bd69fe08&",
    pathname: "/",
});

const { title, metaDescription, ogImageUrl, pathname } = toRefs(props);

const defaultTitle = "Ini Toko";
const baseUrl = config.public.siteUrl;
const pageUrl = baseUrl + pathname.value;

useServerSeoMeta({
    title: title.value + " | " + defaultTitle,
    ogTitle: title.value + " | " + defaultTitle,
    description: metaDescription.value,
    ogDescription: metaDescription.value,
    titleTemplate: title.value + " | " + defaultTitle,
    ogImage: ogImageUrl.value,
    ogImageUrl: ogImageUrl.value,
    twitterTitle: title.value + " | " + defaultTitle,
    twitterDescription: metaDescription.value,
    twitterImage: ogImageUrl.value,
    ogUrl: pageUrl,
    ogType: "website",
    twitterCard: "summary_large_image",
});
</script>